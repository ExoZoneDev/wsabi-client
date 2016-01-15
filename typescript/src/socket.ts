import {EventEmitter} from "events";

export class WsabiSocket extends EventEmitter {
  public static WebSocket = typeof(WebSocket) === "function" ? WebSocket : undefined;
  private static messageRegex = /(\d)(\d*)(.*)/;

  private _socket: WebSocket;
  private messageId = 0;
  private waiting: {
    [key: string]: (data: any) => void;
  } = {};
  private reconnecting: boolean = false;

  constructor(public url: string) {
    super();
  }

  connect() {
    this._socket = new WsabiSocket.WebSocket(`${this.url}/socket.io/?transport=websocket&__sails_io_sdk_version=0.11.0`);
    this._socket.addEventListener("open", () => {
      this.ping();
    });
    this._socket.addEventListener("message", (res) => this._handleSocketMessage(res.data));
    this._socket.addEventListener("close", (res) => {
      this.reconnecting = true;
      setTimeout(() => {
        this.connect();
      }, 10000);
    });
    this._socket.addEventListener("error", (res) => {
      console.log("ERROR:", res);
    });
  }

  close() {
    this._socket.close();
  }

  private _handleSocketMessage(res: string) {
    let match = WsabiSocket.messageRegex.exec(res);
    switch (parseInt(match[1])) {
      case 0:
        if (this.reconnecting) {
          this.reconnecting = false;
          this.emit("reopen");
        }
        this.emit("open");
        break;
      case 1:
        this.close();
        break;
      case 3:
        this.emit("pong");
        break;
      case 4:
        let type = parseInt(match[2][0]);
        let id = parseInt(match[2].slice(1));
        let data;
        try {
          data = JSON.parse(match[3]);
        } catch (_) {
          data = match[3];
        }

        this._handleMessagePacket(type, id, data);
        break;
      default:
        console.warn("Unsupported packet id", match[1]);
    }
  }

  private _handleMessagePacket(type: number, id: number, data: any) {
    switch (type) {
      case 2:
        if (Array.isArray(data) && data.length == 2) {
          this.emit(data[0], data[1]);
        } else {
          this.emit("message", data);
        }
        break;
      case 3:
        if (this.waiting[id] != null) {
          this.waiting[id].call(this, data);
          delete this.waiting[id];
        } else {
          this.emit("response", {
            id: id,
            data: data
          });
        }
        break;
    }
  }

  private ping() {
    if (this._socket.readyState === WsabiSocket.WebSocket.OPEN) {
      this._socket.send("2");
      setTimeout(() => {
        this.ping();
      }, 50000);
    }
  }

  public send(data: any, callback?: (data: any) => void) {
    let id = ++this.messageId;
    if (callback != null) {
      this.wait(id, callback);
    }

    this._socket.send(`42${id}` + JSON.stringify(data));
  }

  public wait(id: number, callback?: (data: any) => void) {
    this.waiting[id] = callback;
  }
  
  public isConnected() {
    return this._socket.readyState === this._socket.OPEN;
  }
}
