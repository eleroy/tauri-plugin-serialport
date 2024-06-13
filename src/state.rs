use serialport::{self, SerialPort};
use std::{
    collections::HashMap,
    sync::{mpsc::Sender, Arc, Mutex},
};

#[derive(Default)]
pub struct SerialPortState {
    // plugin state, configuration fields
    pub serialports: Arc<Mutex<HashMap<String, SerialPortStateInfo>>>,
}
pub struct SerialPortStateInfo {
    pub serialport: Box<dyn SerialPort>,
    pub sender: Option<Sender<usize>>,
}
