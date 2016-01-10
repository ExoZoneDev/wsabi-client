import { WsabiSocket } from "./socket";
import { Observable } from "rxjs/Observable";
export declare class WsabiClient {
    static Promise: PromiseConstructor;
    socket: WsabiSocket;
    liveUrl: string;
    logging: boolean;
    private subscriptions;
    constructor(url: string, autoConnect?: boolean);
    connect(): void;
    request(method: string, url: string, data?: any): Promise<any>;
    get(url: string): Promise<any>;
    post(url: string, data: any): Promise<any>;
    put(url: string, data: any): Promise<any>;
    delete(url: string, data: any): Promise<any>;
    live(slug: string): Observable<any>;
}
