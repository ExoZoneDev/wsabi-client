var socket_1 = require("./socket");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/fromEvent");
var WsabiClient = (function () {
    function WsabiClient(url, autoConnect) {
        if (autoConnect === void 0) { autoConnect = true; }
        this.liveUrl = "/live";
        this.logging = true;
        this.subscriptions = {};
        this.socket = new socket_1.WsabiSocket(url);
        if (autoConnect) {
            this.connect();
        }
    }
    WsabiClient.prototype.connect = function () {
        this.socket.connect();
    };
    WsabiClient.prototype.request = function (method, url, data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return new WsabiClient.Promise(function (resolve) {
            _this.socket.send([
                method,
                {
                    method: method,
                    headers: {},
                    url: url,
                    data: data
                }
            ], resolve);
        }).then(function (res) {
            return res[0];
        });
    };
    WsabiClient.prototype.get = function (url) {
        return this.request("get", url).then(function (res) {
            return res.body;
        });
    };
    WsabiClient.prototype.post = function (url, data) {
        return this.request("post", url, data).then(function (res) {
            return res.body;
        });
    };
    WsabiClient.prototype.put = function (url, data) {
        return this.request("put", url, data).then(function (res) {
            return res.body;
        });
    };
    WsabiClient.prototype.delete = function (url, data) {
        return this.request("delete", url, data).then(function (res) {
            return res.body;
        });
    };
    WsabiClient.prototype.live = function (slug) {
        var _this = this;
        if (!this.subscriptions.hasOwnProperty(slug)) {
            this.subscriptions[slug] = Observable_1.Observable.fromEvent(this.socket, slug);
            this.put(this.liveUrl, { slug: slug }).then(function (res) {
                if (_this.logging) {
                    console.log("[Wsabi]", "[" + slug + "]", res.message || res);
                }
            });
        }
        return this.subscriptions[slug];
    };
    WsabiClient.Promise = typeof (Promise) === "function" ? Promise : undefined;
    return WsabiClient;
})();
exports.WsabiClient = WsabiClient;
//# sourceMappingURL=client.js.map