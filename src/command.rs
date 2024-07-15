use serde::{Serialize, Serializer};
use serialport::{self, SerialPort};
use serialport::{DataBits, FlowControl, Parity, SerialPortInfo, StopBits};
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender, TryRecvError};
use std::thread;
use std::time::Duration;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};
use tauri::Emitter;
use tauri::{command, AppHandle, Runtime, State, Window};

#[derive(Default)]
pub struct SerialPortState {
    // plugin state, configuration fields
    pub serialports: Arc<Mutex<HashMap<String, SerialPortStateInfo>>>,
}
pub struct SerialPortStateInfo {
    pub serialport: Box<dyn SerialPort>,
    pub sender: Option<Sender<usize>>,
}

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("{0}")]
    String(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

fn get_serialport<T, F: FnOnce(&mut SerialPortStateInfo) -> Result<T, Error>>(
    state: State<'_, SerialPortState>,
    path: String,
    f: F,
) -> Result<T, Error> {
    match state.serialports.lock() {
        Ok(mut map) => match map.get_mut(&path) {
            Some(serialport_info) => f(serialport_info),
            None => Err(Error::String("Serial Port not found!".to_string())),
        },
        Err(error) => Err(Error::String(format!(
            "Failed to acquire file lock! {} ",
            error
        ))),
    }
}

/// `available_ports`
#[command]
pub fn available_ports() -> Vec<SerialPortInfo> {
    match serialport::available_ports() {
        Ok(list) => list,
        Err(_) => vec![],
    }
}

#[command]
pub async fn cancel_read<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
    path: String,
) -> Result<(), Error> {
    get_serialport(state, path.clone(), |serialport_info| {
        match &serialport_info.sender {
            Some(sender) => match sender.send(1) {
                Ok(_) => {}
                Err(error) => {
                    return Err(Error::String(format!(
                        "Failed to cancel serial port reading data: {}",
                        error
                    )));
                }
            },
            None => {}
        }
        serialport_info.sender = None;
        println!("Cancel {} serial port reading", &path);
        Ok(())
    })
}

#[command]
pub fn close<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
    path: String,
) -> Result<(), Error> {
    match state.serialports.lock() {
        Ok(mut serialports) => {
            let serial = serialports.remove(&path);
            if serial.is_some() {
                Ok(())
            } else {
                Err(Error::String(format!("Serial port {} not opened!", &path)))
            }
        }
        Err(error) => Err(Error::String(format!("Failed to acquire lock: {}", error))),
    }
}

#[command]
pub fn close_all<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
) -> Result<(), Error> {
    match state.serialports.lock() {
        Ok(mut map) => {
            for serialport_info in map.values() {
                if let Some(sender) = &serialport_info.sender {
                    match sender.send(1) {
                        Ok(_) => {}
                        Err(error) => {
                            println!("Failed to cancel serial port reading data: {}", error);
                            return Err(Error::String(format!(
                                "Failed to cancel serial port reading data: {}",
                                error
                            )));
                        }
                    }
                }
            }
            map.clear();
            Ok(())
        }
        Err(error) => Err(Error::String(format!("Failed to acquire lock: {}", error))),
    }
}

#[command]
pub fn force_close<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
    path: String,
) -> Result<(), Error> {
    match state.serialports.lock() {
        Ok(mut map) => {
            if let Some(serial) = map.get_mut(&path) {
                if let Some(sender) = &serial.sender {
                    match sender.send(1) {
                        Ok(_) => {}
                        Err(error) => {
                            println!("Failed to cancel serial port reading data: {}", error);
                            return Err(Error::String(format!(
                                "Failed to cancel serial port reading data: {}",
                                error
                            )));
                        }
                    }
                }
                map.remove(&path);
                Ok(())
            } else {
                Ok(())
            }
        }
        Err(error) => Err(Error::String(format!("Failed to acquire lock: {}", error))),
    }
}

#[command]
pub fn open<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, SerialPortState>,
    _window: Window<R>,
    path: String,
    baud_rate: u32,
    data_bits: Option<DataBits>,
    flow_control: Option<FlowControl>,
    parity: Option<Parity>,
    stop_bits: Option<StopBits>,
    dtr: Option<bool>,
    timeout: Option<u64>,
) -> Result<(), Error> {
    match state.serialports.lock() {
        Ok(mut serialports) => {
            if serialports.contains_key(&path) {
                return Err(Error::String(format!("Serial port {} not opened!", path)));
            }
            match serialport::new(path.clone(), baud_rate)
                .data_bits(data_bits.unwrap_or(DataBits::Eight))
                .flow_control(flow_control.unwrap_or(FlowControl::None))
                .parity(parity.unwrap_or(Parity::None))
                .stop_bits(stop_bits.unwrap_or(StopBits::Two))
                .timeout(Duration::from_millis(timeout.unwrap_or(1000)))
                .open()
            {
                Ok(serial) => {
                    let mut data = SerialPortStateInfo {
                        serialport: serial,
                        sender: None,
                    };
                    let _ = data
                        .serialport
                        .write_data_terminal_ready(dtr.unwrap_or(false));
                    serialports.insert(path, data);
                    Ok(())
                }
                Err(error) => Err(Error::String(format!(
                    "Access serial port {} failed: {}",
                    path, error.description
                ))),
            }
        }
        Err(error) => Err(Error::String(format!("Failed to acquire lock: {}", error))),
    }
}

#[command]
pub fn read<R: Runtime>(
    app: AppHandle<R>,
    state: State<'_, SerialPortState>,
    path: String,
    timeout: Option<u64>,
) -> Result<(), Error> {
    get_serialport(state.clone(), path.clone(), |serialport_info| {
        if serialport_info.sender.is_some() {
            println!("Already reading data from serial port: {}", &path);
            Ok(())
        } else {
            println!("Start reading data from serial port: {}", &path);
            match serialport_info.serialport.try_clone() {
                Ok(mut serial) => {
                    let read_event = format!("plugin-serialport-read-{}", &path);
                    let (tx, rx): (Sender<usize>, Receiver<usize>) = mpsc::channel();
                    serialport_info.sender = Some(tx);
                    thread::spawn(move || loop {
                        match rx.try_recv() {
                            Ok(_) => {
                                println!("Stop reading data from serial port: {}", &path);
                                break;
                            }
                            Err(error) => match error {
                                TryRecvError::Disconnected => {
                                    println!("Disconnect from serial port {}", &path);
                                    break;
                                }
                                TryRecvError::Empty => {}
                            },
                        }

                        loop {
                            let mut serial_buf: Vec<u8> = vec![0; 0];
                            // Loop reading any available bytes with variable length buffer
                            loop {
                                let pending_bytes = serial.bytes_to_read().unwrap_or(0) as usize;
                                if pending_bytes == 0 {
                                    break;
                                };
                                serial_buf.resize(pending_bytes + serial_buf.len(), 0);
                                let serial_buf_len = serial_buf.len();
                                let _ = serial
                                    .read(&mut serial_buf[(serial_buf_len - pending_bytes)..]);                                
                            }
                            // If anything has been read send it to the app
                            if serial_buf.len() > 0 {
                                match app.emit(&read_event, serial_buf.clone()) {
                                    Ok(_) => {}
                                    Err(error) => {
                                        println!("Failed to send data: {}", error)
                                    }
                                }
                            }
                            if serial.bytes_to_read().unwrap_or(0) == 0 { //If nothing is available on serial port wait to save CPU time
                                thread::sleep(Duration::from_millis(timeout.unwrap_or(10)));
                            }
                        }
                    });
                }
                Err(error) => {
                    return Err(Error::String(format!(
                        "Reading from {} failed: {}",
                        &path, error
                    )));
                }
            }
            Ok(())
        }
    })
}

#[command]
pub fn write<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
    path: String,
    value: String,
) -> Result<usize, Error> {
    get_serialport(state, path.clone(), |serialport_info| match serialport_info
        .serialport
        .write(value.as_bytes())
    {
        Ok(size) => Ok(size),
        Err(error) => Err(Error::String(format!(
            "Write to serial port: {} failed: {}",
            &path, error
        ))),
    })
}

#[command]
pub fn write_binary<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialPortState>,
    path: String,
    value: Vec<u8>,
) -> Result<usize, Error> {
    get_serialport(state, path.clone(), |serialport_info| match serialport_info
        .serialport
        .write(&value)
    {
        Ok(size) => Ok(size),
        Err(error) => Err(Error::String(format!(
            "Write to serial port: {} failed: {}",
            &path, error
        ))),
    })
}
