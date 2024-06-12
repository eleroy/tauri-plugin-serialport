use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

use command::{available_ports, cancel_read, close, close_all, force_close, open, read, write, write_binary};
use state::SerialPortState;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};
mod command;
mod state;
mod error;

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("serialport")
        .invoke_handler(tauri::generate_handler![
            available_ports,
            cancel_read,
            close,
            close_all,
            force_close,
            open,
            read,
            write,
            write_binary,
        ])
        .setup(move |app_handle, _api| {
            app_handle.manage(SerialPortState {
                serialports: Arc::new(Mutex::new(HashMap::new())),
            });
            Ok(())
        })
        .build()
}
