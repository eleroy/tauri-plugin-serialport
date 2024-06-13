import { UnlistenFn } from '@tauri-apps/api/event';
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
export interface InvokeResult {
    code: number;
    message: string;
}
export interface ReadDataResult {
    size: number;
    data: number[];
}
export interface SerialportOptions {
    path: string;
    baudRate: number;
    encoding?: string;
    dataBits?: "Five" | "Six" | "Seven" | "Eight";
    flowControl?: "None" | 'Software' | 'Hardware';
    parity?: "None" | 'Odd' | 'Even';
    stopBits?: "One" | "Two";
    dtr?: boolean;
    timeout?: number;
    size?: number;
    [key: string]: any;
}
interface Options {
    dataBits: "Five" | "Six" | "Seven" | "Eight";
    flowControl: "None" | 'Software' | 'Hardware';
    parity: "None" | 'Odd' | 'Even';
    stopBits: "One" | "Two";
    dtr: null | boolean;
    timeout: null | number;
    [key: string]: any;
}
interface ReadOptions {
    timeout?: number;
    size?: number;
}
declare class Serialport {
    isOpen: boolean;
    unListen?: UnlistenFn;
    encoding: string;
    options: Options;
    size: number;
    constructor(options: SerialportOptions);
    /**
     * @description: 获取串口列表
     * @return {Promise<string[]>}
     */
    static available_ports(): Promise<SerialPortInfo[]>;
    /**
     * @description: 强制关闭
     * @param {string} path
     * @return {Promise<void>}
     */
    static forceClose(path: string): Promise<void>;
    /**
     * @description: 关闭所有串口
     * @return {Promise<void>}
     */
    static closeAll(): Promise<void>;
    /**
     * @description: 取消串口监听
     * @return {Promise<void>}
     */
    cancelListen(): Promise<void>;
    /**
     * @description: 取消读取数据
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
     * @description: 关闭串口
     * @return {Promise<InvokeResult>}
     */
    close(): Promise<void>;
    /**
     * @description: 监听串口信息
     * @param {function} fn
     * @return {Promise<void>}
     */
    listen(fn: (...args: any[]) => void, isDecode?: boolean): Promise<void>;
    /**
     * @description: 打开串口
     * @return {*}
     */
    open(): Promise<void>;
    /**
     * @description: 读取串口信息
     * @param {ReadOptions} options 读取选项 { timeout, size }
     * @return {Promise<void>}
     */
    read(options?: ReadOptions): Promise<void>;
    /**
     * @description: 设置串口 波特率
     * @param {number} value
     * @return {Promise<void>}
     */
    setBaudRate(value: number): Promise<void>;
    /**
     * @description: 设置串口 path
     * @param {string} value
     * @return {Promise<void>}
     */
    setPath(value: string): Promise<void>;
    /**
     * @description: 串口写入数据
     * @param {string} value
     * @return {Promise<number>}
     */
    write(value: string): Promise<number>;
    /**
     * @description: 写入二进制数据到串口
     * @param {Uint8Array} value
     * @return {Promise<number>}
     */
    writeBinary(value: Uint8Array | number[]): Promise<number>;
}
export { Serialport };
