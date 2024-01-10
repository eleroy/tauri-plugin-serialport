use crate::err::Err;
use crate::state::{ReadData, SerialportInfo, SerialportState};
use serialport::{DataBits, FlowControl, Parity, StopBits, SerialPortInfo, SerialPortType};
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender, TryRecvError};
use std::thread;
use std::time::Duration;
use tauri::{command, AppHandle, Runtime, State, Window};

fn get_serialport<T, F: FnOnce(&mut SerialportInfo) -> Result<T, Err>>(
    state: State<'_, SerialportState>,
    path: String,
    f: F,
) -> Result<T, Err> {
    match state.serialports.lock() {
        Ok(mut map) => match map.get_mut(&path) {
            Some(serialport_info) => f(serialport_info),
            None => {
                Err(Err::String("Serial Port not found!".to_string()))
            }
        },
        Err(error) =>  Err(Err::String(format!("Failed to acquire file lock! {} ", error))),
    }
}

fn get_data_bits(value: Option<usize>) -> DataBits {
    match value {
        Some(value) => match value {
            5 => DataBits::Five,
            6 => DataBits::Six,
            7 => DataBits::Seven,
            8 => DataBits::Eight,
            _ => DataBits::Eight,
        },
        None => DataBits::Eight,
    }
}

fn get_flow_control(value: Option<String>) -> FlowControl {
    match value {
        Some(value) => match value.as_str() {
            "Software" => FlowControl::Software,
            "Hardware" => FlowControl::Hardware,
            _ => FlowControl::None,
        },
        None => FlowControl::None,
    }
}

fn get_parity(value: Option<String>) -> Parity {
    match value {
        Some(value) => match value.as_str() {
            "Odd" => Parity::Odd,
            "Even" => Parity::Even,
            _ => Parity::None,
        },
        None => Parity::None,
    }
}

fn get_stop_bits(value: Option<usize>) -> StopBits {
    match value {
        Some(value) => match value {
            1 => StopBits::One,
            2 => StopBits::Two,
            _ => StopBits::Two,
        },
        None => StopBits::Two,
    }
}


/// `available_ports` 获取串口列表
#[command]
pub fn available_ports() -> Vec<String> {
    let mut list = match serialport::available_ports() {
        Ok(list) => list,
        Err(_) => vec![],
    };
    //list.sort_by(|a, b| a.port_name.cmp(&b.port_name));
/*info.vid, info.pid);
                        println!(
                            "     Serial Number: {}",
                            info.serial_number.as_ref().map_or("", String::as_str)
                        );
                        println!(
                            "      Manufacturer: {}",
                            info.manufacturer.as_ref().map_or("", String::as_str)
                        );
                        println!(
                            "           Product: {}",
                            info.product.as_ref().map_or("", String::as_str) */
    let mut name_list: Vec<String> = vec![];
    for i in list {
        let port_name = i.port_name;
        let mut port_info: String = format!("{{'path':'{port_name}'").to_owned();
        match i.port_type {
            SerialPortType::UsbPort(info) => {
                let vid = info.vid;
                let pid = info.pid;
                let manufacturer = info.manufacturer.as_ref().map_or("", String::as_str);
                let serial_number = info.serial_number.as_ref().map_or("", String::as_str);
                port_info.push_str(&format!(",'vid':'{vid:04x}'"));
                port_info.push_str(&format!(",'pid':'{pid:04x}'"));
                port_info.push_str(&format!(",'sn':'{serial_number}'"));
                port_info.push_str(&format!(",'manufacturer':'{manufacturer}'"));
                port_info.push_str(&format!(",'type':'usb'"));
                
            }
            SerialPortType::BluetoothPort => {
                port_info.push_str(&format!(",'type':'bluetooth'"));
            }
            SerialPortType::PciPort => {
                port_info.push_str(&format!(",'type':'PCI'"));
            }
            SerialPortType::Unknown => {
                port_info.push_str(&format!(",'type':'Unknown'"));
            }
        }
        port_info.push_str("}");
        name_list.push(port_info);

    }

    // println!("串口列表: {:?}", &name_list);

    name_list
}


#[command]
pub async fn cancel_read<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialportState>,
    path: String,
) -> Result<(), Err> {
    get_serialport(state, path.clone(), |serialport_info| {
        match &serialport_info.sender {
            Some(sender) => match sender.send(1) {
                Ok(_) => {}
                Err(error) => {
                    return Err(Err::String(format!("Failed to cancel serial port reading data: {}", error)));
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
    state: State<'_, SerialportState>,
    path: String,
) -> Result<(), Err> {
    match state.serialports.lock() {
        Ok(mut serialports) => {
            if serialports.remove(&path).is_some() {
                Ok(())
            } else {
                Err(Err::String(format!("Serial port {} not opened!", &path)))
            }
        }
        Err(error) => {
            Err(Err::String(format!("Failed to acquire lock: {}", error)))
        }
    }
}

#[command]
pub fn close_all<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialportState>,
) -> Result<(), Err> {
    match state.serialports.lock() {
        Ok(mut map) => {
            for serialport_info in map.values() {
                if let Some(sender) = &serialport_info.sender {
                    match sender.send(1) {
                        Ok(_) => {}
                        Err(error) => {
                            println!("Failed to cancel serial port reading data: {}", error);
                            return Err(Err::String(format!("Failed to cancel serial port reading data: {}", error)));
                        }
                    }
                }
            }
            map.clear();
            Ok(())
        }
        Err(error) => {
            Err(Err::String(format!("Failed to acquire lock: {}", error)))
        }
    }
}

#[command]
pub fn force_close<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialportState>,
    path: String,
) -> Result<(), Err> {
    match state.serialports.lock() {
        Ok(mut map) => {
            if let Some(serial) = map.get_mut(&path) {
                if let Some(sender) = &serial.sender {
                    match sender.send(1) {
                        Ok(_) => {}
                        Err(error) => {
                            println!("Failed to cancel serial port reading data: {}", error);
                            return Err(Err::String(format!("Failed to cancel serial port reading data: {}", error)));
                        }
                    }
                }
                map.remove(&path);
                Ok(())
            } else {
                Ok(())
            }
        }
        Err(error) => {
            Err(Err::String(format!("Failed to acquire lock: {}", error)))
        }
    }
}

#[command]
pub fn open<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, SerialportState>,
    _window: Window<R>,
    path: String,
    baud_rate: u32,
    data_bits: Option<usize>,
    flow_control: Option<String>,
    parity: Option<String>,
    stop_bits: Option<usize>,
    timeout: Option<u64>,
) -> Result<(), Err> {
    match state.serialports.lock() {
        Ok(mut serialports) => {
            if serialports.contains_key(&path) {
                return Err(Err::String(format!("Serial port {} not opened!", path)));
            }
            match serialport::new(path.clone(), baud_rate)
                .data_bits(get_data_bits(data_bits))
                .flow_control(get_flow_control(flow_control))
                .parity(get_parity(parity))
                .stop_bits(get_stop_bits(stop_bits))
                .timeout(Duration::from_millis(timeout.unwrap_or(200)))
                .open()
            {
                Ok(serial) => {
                    let data = SerialportInfo {
                        serialport: serial,
                        sender: None,
                    };
                    serialports.insert(path, data);
                    Ok(())
                }
                Err(error) => Err(Err::String(format!(
                    "Access serial port {} failed: {}",
                    path,
                    error.description
                ))),
            }
        }
        Err(error) => {
            Err(Err::String(format!("Failed to acquire lock: {}", error)))
        }
    }
}

#[command]
pub fn read<R: Runtime>(
    _app: AppHandle<R>,
    window: Window<R>,
    state: State<'_, SerialportState>,
    path: String,
    timeout: Option<u64>,
    size: Option<usize>,
) -> Result<(), Err> {
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
                        let mut serial_buf: Vec<u8> = vec![0; size.unwrap_or(4096)];
                        loop {
                            match serial.bytes_to_read() {
                                Ok(n_bytes)=>{
                                    if n_bytes==0 {
                                        break
                                    };
                                }
                                Err(_err) => {
                                    break
                                }
                            }
                            match serial.read(serial_buf.as_mut_slice()) {
                                Ok(size) => {
                                    println!("Serial port: {} Read data size v while: {}", &path, size);
                                    match window.emit(
                                        &read_event,
                                        ReadData {
                                            data: &serial_buf[..size],
                                            size,
                                        },
                                    ) {
                                        Ok(_) => {}
                                        Err(error) => {
                                            println!("Failed to send data: {}", error)
                                        }
                                    }
                                }
                                Err(_err) => {
                                    
                                }
                            }
                    }
                        thread::sleep(Duration::from_millis(timeout.unwrap_or(100)));
                    });
                }
                Err(error) => {
                    return Err(Err::String(format!("Reading from {} failed: {}", &path, error)));
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
    state: State<'_, SerialportState>,
    path: String,
    value: String,
) -> Result<usize, Err> {
    get_serialport(state, path.clone(), |serialport_info| {
        match serialport_info.serialport.write(value.as_bytes()) {
            Ok(size) => {
                Ok(size)
        }
            Err(error) => {
                Err(Err::String(format!(
                    "Write to serial port: {} failed: {}",
                    &path, error
                )))
            }
        }
    })
}

#[command]
pub fn write_binary<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, SerialportState>,
    path: String,
    value: Vec<u8>,
) -> Result<usize, Err> {
    get_serialport(state, path.clone(), |serialport_info| match serialport_info
        .serialport
        .write(&value)
    {
        Ok(size) => {
            Ok(size)
        }
        Err(error) => {
            Err(Err::String(format!(
                "Write to serial port: {} failed: {}",
                &path, error
            )))
        }
    })
}
