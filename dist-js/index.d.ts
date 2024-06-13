import { UnlistenFn } from "@tauri-apps/api/event";
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
    encoding?: string;
    dataBits?: "Five" | "Six" | "Seven" | "Eight";
    flowControl?: "None" | "Software" | "Hardware";
    parity?: "None" | "Odd" | "Even";
    stopBits?: "One" | "Two";
    dtr?: boolean;
    timeout?: number;
}
interface ReadOptions {
    timeout?: number;
}
export declare class SerialPort {
    isOpen: boolean;
    unListen?: UnlistenFn;
    encoding: string;
    options: SerialPortOptions;
    constructor(options: SerialPortOptions);
    /**
     * @description: Returns available serial ports.
     * @return {Promise<SerialPortInfo[]>}
     */
    static available_ports(): Promise<SerialPortInfo[]>;
    /**
     * @description: Force close current connection
     * @param {string} path
     * @return {Promise<void>}
     */
    static forceClose(path: string): Promise<void>;
    /**
     * @description: Close all connections
     * @return {Promise<void>}
     */
    static closeAll(): Promise<void>;
    /**
     * @description: Cancel listening
     * @return {Promise<void>}
     */
    cancelListen(): Promise<void>;
    /**
     * @description: Cancel reading from current port
     * @return {Promise<void>}
     */
    cancelRead(): Promise<void>;
    /**
     * @description:
     * @param {object} options
     * @return {Promise<void>}
     */
    change(options: {
        path?: string;
        baudRate?: number;
    }): Promise<void>;
    /**
     * @description: Close current port
     * @return {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * @description: Start listening to any read data
     * @param {function} fn
     * @return {Promise<void>}
     */
    listen(fn: (...args: any[]) => void, decode?: boolean): Promise<void>;
    /**
     * @description: Open serial connection
     * @return {*}
     */
    open(): Promise<void>;
    /**
     * @description: Start reading from serial port
     * @param {ReadOptions} options optional, {timeout}
     * @return {Promise<void>}
     */
    read(options?: ReadOptions): Promise<void>;
    /**
     * @description: set current port baudrate
     * @param {number} value
     * @return {Promise<void>}
     */
    setBaudRate(value: number): Promise<void>;
    /**
     * @description: set current connection path
     * @param {string} value
     * @return {Promise<void>}
     */
    setPath(value: string): Promise<void>;
    /**
     * @description: write to serial port
     * @param {string} value
     * @return {Promise<number>}
     */
    write(value: string): Promise<number>;
    /**
     * @description: write binary to serial port
     * @param {Uint8Array} value
     * @return {Promise<number>}
     */
    writeBinary(value: Uint8Array | number[]): Promise<number>;
}
export {};
