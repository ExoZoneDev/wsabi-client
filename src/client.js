var socket_1 = require("./socket");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/fromEvent");
var WsabiClient = (function () {
    function WsabiClient(url, autoConnect) {
        var _this = this;
        if (autoConnect === void 0) { autoConnect = true; }
        this.liveUrl = "/live";
        this.logging = true;
        this.subscriptions = {};
        this.socket = new socket_1.WsabiSocket(url);
        this.socket.on("reopen", function () {
            var slugs = Object.keys(_this.subscriptions);
            for (var i = 0, len = slugs.length; i < len; i++) {
                _this.put(_this.liveUrl, { slug: slugs[i] });
            }
        });
        if (autoConnect) {
            this.connect();
        }
    }
    WsabiClient.prototype.connect = function () {
        this.socket.connect();
    };
    WsabiClient.prototype.request = function (method, url, data, headers) {
        var _this = this;
        if (data === void 0) { data = {}; }
        if (headers === void 0) { headers = {}; }
        return new WsabiClient.Promise(function (resolve, reject) {
            if (!_this.socket.isConnected()) {
                _this.socket.once("open", function () {
                    _this.socket.send([
                        method,
                        {
                            method: method,
                            headers: headers,
                            url: url,
                            data: data
                        }
                    ], function (data) {
                        if (data[0].statusCode != 200) {
                            reject(data[0]);
                        }
                        else {
                            resolve(data);
                        }
                    });
                });
            }
            else {
                _this.socket.send([
                    method,
                    {
                        method: method,
                        headers: headers,
                        url: url,
                        data: data
                    }
                ], function (data) {
                    if (data[0].statusCode != 200) {
                        reject(data[0]);
                    }
                    else {
                        resolve(data);
                    }
                });
            }
        }).then(function (res) {
            return res[0];
        });
    };
    WsabiClient.prototype.get = function (url, headers) {
        if (headers === void 0) { headers = {}; }
        return this.request("get", url, {}, headers).then(function (res) {
            return res.body;
        });
    };
    WsabiClient.prototype.post = function (url, data, headers) {
        if (headers === void 0) { headers = {}; }
        return this.request("post", url, data, headers).then(function (res) {
            return res.body;
        });
    };
    WsabiClient.prototype.put = function (url, data, headers) {
        if (headers === void 0) { headers = {}; }
        return this.request("put", url, data, headers).then(function (res) {
            return res.body;
        });
    };
    WsabiClient.prototype.delete = function (url, data, headers) {
        if (headers === void 0) { headers = {}; }
        return this.request("delete", url, data, headers).then(function (res) {
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