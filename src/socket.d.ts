import { EventEmitter } from "events";
export declare class WsabiSocket extends EventEmitter {
    url: string;
    static WebSocket: {
        new (url: string, protocols?: string | string[]): WebSocket;
        prototype: WebSocket;
        CLOSED: number;
        CLOSING: number;
        CONNECTING: number;
        OPEN: number;
    };
    private static messageRegex;
    private _socket;
    private messageId;
    private waiting;
    private reconnecting;
    constructor(url: string);
    connect(): void;
    close(): void;
    private _handleSocketMessage(res);
    private _handleMessagePacket(type, id, data);
    private ping();
    send(data: any, callback?: (data: any) => void): void;
    wait(id: number, callback?: (data: any) => void): void;
    isConnected(): boolean;
}
