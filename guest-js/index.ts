import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export interface SerialPortInfo {
  port_name: string;
  port_type: PortType;
}

export interface PortType {
  UsbPort: UsbPort;
}

export interface UsbPort {
  manufacturer: string;
  pid: number;
  product: string;
  serial_number: string;
  vid: number;
}

export interface SerialPortOptions {
  path: string;
  baudRate: number;
  dataBits: "Five" | "Six" | "Seven" | "Eight";
  flowControl: "None" | "Software" | "Hardware";
  parity: "None" | "Odd" | "Even";
  stopBits: "One" | "Two";
  dtr: boolean;
  timeout?: number;
}

interface ReadOptions {
  timeout?: number;
}

export class SerialPort {
  isOpen: boolean;
  unListen?: UnlistenFn;
  encoding: string;
  options: SerialPortOptions;

  constructor(options: SerialPortOptions) {
    this.isOpen = false;
    this.encoding = "utf-8";
    this.options = {
      path: options.path,
      baudRate: options.baudRate,
      dataBits: options.dataBits || "Eight",
      flowControl: options.flowControl || "None",
      parity: options.parity || "None",
      stopBits: options.stopBits || "Two",
      dtr: options.dtr || false,
      timeout: options.timeout || 200,      
    };
  }

  /**
   * @description: Returns available serial ports.
   * @return {Promise<SerialPortInfo[]>}
   */
  static async available_ports(): Promise<SerialPortInfo[]> {
    try {
      return await invoke<SerialPortInfo[]>(
        "plugin:serialport|available_ports",
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description: Force close current connection
   * @param {string} path
   * @return {Promise<void>}
   */
  static async forceClose(path: string): Promise<void> {
    return await invoke<void>("plugin:serialport|force_close", {
      path,
    });
  }

  /**
   * @description: Close all connections
   * @return {Promise<void>}
   */
  static async closeAll(): Promise<void> {
    return await invoke<void>("plugin:serialport|close_all");
  }

  /**
   * @description: Cancel listening
   * @return {Promise<void>}
   */
  async cancelListen(): Promise<void> {
    try {
      if (this.unListen) {
        this.unListen();
        this.unListen = undefined;
      }
      return;
    } catch (error) {
      return Promise.reject("Impossible to cancel listening: " + error);
    }
  }

  /**
   * @description: Cancel reading from current port
   * @return {Promise<void>}
   */
  async cancelRead(): Promise<void> {
    try {
      return await invoke<void>("plugin:serialport|cancel_read", {
        path: this.options.path,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description:
   * @param {object} options
   * @return {Promise<void>}
   */
  async change(options: { path?: string; baudRate?: number }): Promise<void> {
    try {
      let isOpened = false;
      if (this.isOpen) {
        isOpened = true;
        await this.close();
      }
      if (options.path) {
        this.options.path = options.path;
      }
      if (options.baudRate) {
        this.options.baudRate = options.baudRate;
      }
      if (isOpened) {
        await this.open();
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description: Close current port
   * @return {Promise<void>}
   */
  async close(): Promise<void> {
    try {
      if (!this.isOpen) {
        return;
      }
      await this.cancelRead();
      const res = await invoke<void>("plugin:serialport|close", {
        path: this.options.path,
      });

      await this.cancelListen();
      this.isOpen = false;
      return res;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description: Start listening to any read data
   * @param {function} fn
   * @return {Promise<void>}
   */
  async listen(fn: (...args: any[]) => void, decode = true): Promise<void> {
    try {
      await this.cancelListen();
      let readEvent = "plugin-serialport-read-" + this.options.path;
      this.unListen = await listen<number[]>(readEvent, ({ payload }) => {
        try {
          if (decode) {
            const decoder = new TextDecoder(this.encoding);
            const data = decoder.decode(new Uint8Array(payload));
            fn(data);
          } else {
            fn(new Uint8Array(payload));
          }
        } catch (error) {
          console.error(error);
        }
      });
      return;
    } catch (error) {
      return Promise.reject("Impossible to start listening: " + error);
    }
  }

  /**
   * @description: Open serial connection
   * @return {*}
   */
  async open(): Promise<void> {
    try {
      if (!this.options.path) {
        return Promise.reject(`Incorrect path`);
      }
      if (!this.options.baudRate) {
        return Promise.reject(`Incorrect baudrate`);
      }
      if (this.isOpen) {
        return;
      }
      const res = await invoke<void>("plugin:serialport|open", {
        path: this.options.path,
        baudRate: this.options.baudRate,
        dataBits: this.options.dataBits,
        flowControl: this.options.flowControl,
        parity: this.options.parity,
        stopBits: this.options.stopBits,
        dtr: this.options.dtr,
        timeout: this.options.timeout,       
      });
      this.isOpen = true;
      return Promise.resolve(res);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description: Start reading from serial port
   * @param {ReadOptions} options optional, {timeout}
   * @return {Promise<void>}
   */
  async read(options?: ReadOptions): Promise<void> {
    try {
      return await invoke<void>("plugin:serialport|read", {
        path: this.options.path,
        timeout: options?.timeout || this.options.timeout,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description: set current port baudrate
   * @param {number} value
   * @return {Promise<void>}
   */
  async setBaudRate(value: number): Promise<void> {
    try {
      let isOpened = false;
      if (this.isOpen) {
        isOpened = true;
        await this.close();
      }
      this.options.baudRate = value;
      if (isOpened) {
        await this.open();
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description: set current connection path
   * @param {string} value
   * @return {Promise<void>}
   */
  async setPath(value: string): Promise<void> {
    try {
      let isOpened = false;
      if (this.isOpen) {
        isOpened = true;
        await this.close();
      }
      this.options.path = value;
      if (isOpened) {
        await this.open();
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description: write to serial port
   * @param {string} value
   * @return {Promise<number>}
   */
  async write(value: string): Promise<number> {
    try {
      if (!this.isOpen) {
        return Promise.reject(`Impossible to write to ${this.options.path}`);
      }
      return await invoke<number>("plugin:serialport|write", {
        value,
        path: this.options.path,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description: write binary to serial port
   * @param {Uint8Array} value
   * @return {Promise<number>}
   */
  async writeBinary(value: Uint8Array | number[]): Promise<number> {
    try {
      if (!this.isOpen) {
        return Promise.reject(`Impossible to write to ${this.options.path}`);
      }
      if (value instanceof Uint8Array || value instanceof Array) {
        return await invoke<number>("plugin:serialport|write_binary", {
          value: Array.from(value),
          path: this.options.path,
        });
      } else {
        return Promise.reject(
          "value must be one of these types: string, Uint8Array, number[]",
        );
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
