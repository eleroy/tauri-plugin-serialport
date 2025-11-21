# Tauri Plugin serialport

This plugin is based on the plugin developped by lzhida. https://github.com/lzhida/tauri-plugin-serialport.

A lot of the API is similar, but it differs on few aspects:
- It should be used with tauri v2 and is incompatible withe tauri v1
- It uses the structures from serialport-rs and does not implement custom structures
- Chinese comment or messages have been translated or removed.
- It includes additional features:
  - Possibility to set DTR (for some CDC devices such as Raspberry pico)
  - list_available_ports returns a rich structure including vid, pid, serial number
  - The reading section has been reworked so that it can read long messages before sending them to the frontend resulting overall on faster read time

## Why another tauri serial plugin ?

There are two other repo for a tauri serial plugin on github:
- https://github.com/lzhida/tauri-plugin-serialport
- https://github.com/deid84/tauri-plugin-serialport

The first one is the one I forked initially, it was not compatible with tauri v2 and it was missing some features I needed (serial port details when listing them and support for DTR). The second one is very similar to the one lzhida developped but with updated dependencies and translated messages.

I reworked the source code to simplify the plugin, make it compatible with tauri v2 and added a few features.

## Installation

There are three general methods of installation that we can recommend.

1. Pull sources directly from Github using git tags / revision hashes (most secure, good for developement, shown below)
2. Git submodule install this repo in your tauri project and then use file protocol to ingest the source
3. Use crates.io and npm (easiest, and requires you to trust that our publishing pipeline worked)

For more details and usage see the example app. Please note, below in the dependencies you can also lock to a revision/tag in both the `Cargo.toml` and `package.json`

### Rust

`src-tauri/Cargo.toml`

```toml
[dependencies.tauri-plugin-serialport]
git = "https://github.com/eleroy/tauri-plugin-serialport"
version = "v2.1.0"
```

Use in `src-tauri/src/main.rs`:

```RUST
use tauri_plugin_serialport;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_serialport::init())
        .build()
        .run();
}
```

### JS


```
npm install tauri-plugin-serialport-api@https://github.com/eleroy/tauri-plugin-serialport
# or
yarn add tauri-plugin-serialport-api@https://github.com/eleroy/tauri-plugin-serialport
```

## USAGE

Use within your JS/TS:

```TS
import { SerialPort } from 'tauri-plugin-serialport-api';
const availablePorts = await SerialPort.available_ports()
console.log(availablePorts)
const serialPort = new SerialPort(
  {
    path: availablePorts[0].port_name, 
    baudRate:115200, 
    dtr:true
  })
await serialPort.open()
await serialPort.read({timeout:10})
serialPort.listen((data) => console.log(data), decode=true)
await serialPort.write("Hello world")
```
