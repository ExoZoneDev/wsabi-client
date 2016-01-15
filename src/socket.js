var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require("events");
var WsabiSocket = (function (_super) {
    __extends(WsabiSocket, _super);
    function WsabiSocket(url) {
        _super.call(this);
        this.url = url;
        this.messageId = 0;
        this.waiting = {};
        this.reconnecting = false;
    }
    WsabiSocket.prototype.connect = function () {
        var _this = this;
        this._socket = new WsabiSocket.WebSocket(this.url + "/socket.io/?transport=websocket&__sails_io_sdk_version=0.11.0");
        this._socket.addEventListener("open", function () {
            _this.ping();
        });
        this._socket.addEventListener("message", function (res) { return _this._handleSocketMessage(res.data); });
        this._socket.addEventListener("close", function (res) {
            _this.reconnecting = true;
            setTimeout(function () {
                _this.connect();
            }, 10000);
        });
        this._socket.addEventListener("error", function (res) {
            console.log("ERROR:", res);
        });
    };
    WsabiSocket.prototype.close = function () {
        this._socket.close();
    };
    WsabiSocket.prototype._handleSocketMessage = function (res) {
        var match = WsabiSocket.messageRegex.exec(res);
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
                var type = parseInt(match[2][0]);
                var id = parseInt(match[2].slice(1));
                var data;
                try {
                    data = JSON.parse(match[3]);
                }
                catch (_) {
                    data = match[3];
                }
                this._handleMessagePacket(type, id, data);
                break;
            default:
                console.warn("Unsupported packet id", match[1]);
        }
    };
    WsabiSocket.prototype._handleMessagePacket = function (type, id, data) {
        switch (type) {
            case 2:
                if (Array.isArray(data) && data.length == 2) {
                    this.emit(data[0], data[1]);
                }
                else {
                    this.emit("message", data);
                }
                break;
            case 3:
                if (this.waiting[id] != null) {
                    this.waiting[id].call(this, data);
                    delete this.waiting[id];
                }
                else {
                    this.emit("response", {
                        id: id,
                        data: data
                    });
                }
                break;
        }
    };
    WsabiSocket.prototype.ping = function () {
        var _this = this;
        if (this._socket.readyState === WsabiSocket.WebSocket.OPEN) {
            this._socket.send("2");
            setTimeout(function () {
                _this.ping();
            }, 50000);
        }
    };
    WsabiSocket.prototype.send = function (data, callback) {
        var id = ++this.messageId;
        if (callback != null) {
            this.wait(id, callback);
        }
        this._socket.send(("42" + id) + JSON.stringify(data));
    };
    WsabiSocket.prototype.wait = function (id, callback) {
        this.waiting[id] = callback;
    };
    WsabiSocket.prototype.isConnected = function () {
        return this._socket.readyState === this._socket.OPEN;
    };
    WsabiSocket.WebSocket = typeof (WebSocket) === "function" ? WebSocket : undefined;
    WsabiSocket.messageRegex = /(\d)(\d*)(.*)/;
    return WsabiSocket;
})(events_1.EventEmitter);
exports.WsabiSocket = WsabiSocket;
//# sourceMappingURL=socket.js.map