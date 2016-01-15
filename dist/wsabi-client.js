/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var socket_1 = __webpack_require__(1);
	exports.WsabiSocket = socket_1.WsabiSocket;
	var client_1 = __webpack_require__(3);
	exports.WsabiClient = client_1.WsabiClient;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var events_1 = __webpack_require__(2);
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


/***/ },
/* 2 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;
	
	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;
	
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;
	
	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;
	
	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};
	
	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;
	
	  if (!this._events)
	    this._events = {};
	
	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }
	
	  handler = this._events[type];
	
	  if (isUndefined(handler))
	    return false;
	
	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }
	
	  return true;
	};
	
	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events)
	    this._events = {};
	
	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);
	
	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];
	
	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }
	
	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.on = EventEmitter.prototype.addListener;
	
	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  var fired = false;
	
	  function g() {
	    this.removeListener(type, g);
	
	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }
	
	  g.listener = listener;
	  this.on(type, g);
	
	  return this;
	};
	
	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events || !this._events[type])
	    return this;
	
	  list = this._events[type];
	  length = list.length;
	  position = -1;
	
	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	
	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }
	
	    if (position < 0)
	      return this;
	
	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }
	
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;
	
	  if (!this._events)
	    return this;
	
	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }
	
	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }
	
	  listeners = this._events[type];
	
	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];
	
	  return this;
	};
	
	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};
	
	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];
	
	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};
	
	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	
	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var socket_1 = __webpack_require__(1);
	var Observable_1 = __webpack_require__(4);
	__webpack_require__(14);
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
	                        reject(data);
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


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Subscriber_1 = __webpack_require__(5);
	var root_1 = __webpack_require__(12);
	var SymbolShim_1 = __webpack_require__(11);
	var rxSubscriber_1 = __webpack_require__(10);
	/**
	 * A representation of any set of values over any amount of time. This the most basic building block
	 * of RxJS.
	 *
	 * @class Observable<T>
	 */
	var Observable = (function () {
	    /**
	     * @constructor
	     * @param {Function} subscribe the function that is
	     * called when the Observable is initially subscribed to. This function is given a Subscriber, to which new values
	     * can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify
	     * of a successful completion.
	     */
	    function Observable(subscribe) {
	        this._isScalar = false;
	        if (subscribe) {
	            this._subscribe = subscribe;
	        }
	    }
	    /**
	     * @method lift
	     * @param {Operator} operator the operator defining the operation to take on the observable
	     * @returns {Observable} a new observable with the Operator applied
	     * @description creates a new Observable, with this Observable as the source, and the passed
	     * operator defined as the new observable's operator.
	     */
	    Observable.prototype.lift = function (operator) {
	        var observable = new Observable();
	        observable.source = this;
	        observable.operator = operator;
	        return observable;
	    };
	    /**
	     * @method Symbol.observable
	     * @returns {Observable} this instance of the observable
	     * @description an interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
	     */
	    Observable.prototype[SymbolShim_1.SymbolShim.observable] = function () {
	        return this;
	    };
	    /**
	     * @method subscribe
	     * @param {Observer|Function} observerOrNext (optional) either an observer defining all functions to be called,
	     *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
	     * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
	     *  the error will be thrown as unhandled
	     * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
	     * @returns {Subscription} a subscription reference to the registered handlers
	     * @description registers handlers for handling emitted values, error and completions from the observable, and
	     *  executes the observable's subscriber function, which will take action to set up the underlying data stream
	     */
	    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
	        var subscriber;
	        if (observerOrNext && typeof observerOrNext === 'object') {
	            if (observerOrNext instanceof Subscriber_1.Subscriber) {
	                subscriber = observerOrNext;
	            }
	            else if (observerOrNext[rxSubscriber_1.rxSubscriber]) {
	                subscriber = observerOrNext[rxSubscriber_1.rxSubscriber]();
	            }
	            else {
	                subscriber = new Subscriber_1.Subscriber(observerOrNext);
	            }
	        }
	        else {
	            var next = observerOrNext;
	            subscriber = Subscriber_1.Subscriber.create(next, error, complete);
	        }
	        subscriber.add(this._subscribe(subscriber));
	        return subscriber;
	    };
	    /**
	     * @method forEach
	     * @param {Function} next a handler for each value emitted by the observable
	     * @param {any} [thisArg] a `this` context for the `next` handler function
	     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
	     * @returns {Promise} a promise that either resolves on observable completion or
	     *  rejects with the handled error
	     */
	    Observable.prototype.forEach = function (next, thisArg, PromiseCtor) {
	        if (!PromiseCtor) {
	            if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
	                PromiseCtor = root_1.root.Rx.config.Promise;
	            }
	            else if (root_1.root.Promise) {
	                PromiseCtor = root_1.root.Promise;
	            }
	        }
	        if (!PromiseCtor) {
	            throw new Error('no Promise impl found');
	        }
	        var nextHandler;
	        if (thisArg) {
	            nextHandler = function nextHandlerFn(value) {
	                var _a = nextHandlerFn, thisArg = _a.thisArg, next = _a.next;
	                return next.call(thisArg, value);
	            };
	            nextHandler.thisArg = thisArg;
	            nextHandler.next = next;
	        }
	        else {
	            nextHandler = next;
	        }
	        var promiseCallback = function promiseCallbackFn(resolve, reject) {
	            var _a = promiseCallbackFn, source = _a.source, nextHandler = _a.nextHandler;
	            source.subscribe(nextHandler, reject, resolve);
	        };
	        promiseCallback.source = this;
	        promiseCallback.nextHandler = nextHandler;
	        return new PromiseCtor(promiseCallback);
	    };
	    Observable.prototype._subscribe = function (subscriber) {
	        return this.source._subscribe(this.operator.call(subscriber));
	    };
	    // HACK: Since TypeScript inherits static properties too, we have to
	    // fight against TypeScript here so Subject can have a different static create signature
	    /**
	     * @static
	     * @method create
	     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
	     * @returns {Observable} a new cold observable
	     * @description creates a new cold Observable by calling the Observable constructor
	     */
	    Observable.create = function (subscribe) {
	        return new Observable(subscribe);
	    };
	    return Observable;
	})();
	exports.Observable = Observable;
	//# sourceMappingURL=Observable.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var noop_1 = __webpack_require__(6);
	var throwError_1 = __webpack_require__(7);
	var tryOrOnError_1 = __webpack_require__(8);
	var Subscription_1 = __webpack_require__(9);
	var rxSubscriber_1 = __webpack_require__(10);
	var Subscriber = (function (_super) {
	    __extends(Subscriber, _super);
	    function Subscriber(destination) {
	        _super.call(this);
	        this.destination = destination;
	        this._isUnsubscribed = false;
	        if (!this.destination) {
	            return;
	        }
	        var subscription = destination._subscription;
	        if (subscription) {
	            this._subscription = subscription;
	        }
	        else if (destination instanceof Subscriber) {
	            this._subscription = destination;
	        }
	    }
	    Subscriber.prototype[rxSubscriber_1.rxSubscriber] = function () {
	        return this;
	    };
	    Object.defineProperty(Subscriber.prototype, "isUnsubscribed", {
	        get: function () {
	            var subscription = this._subscription;
	            if (subscription) {
	                // route to the shared Subscription if it exists
	                return this._isUnsubscribed || subscription.isUnsubscribed;
	            }
	            else {
	                return this._isUnsubscribed;
	            }
	        },
	        set: function (value) {
	            var subscription = this._subscription;
	            if (subscription) {
	                // route to the shared Subscription if it exists
	                subscription.isUnsubscribed = Boolean(value);
	            }
	            else {
	                this._isUnsubscribed = Boolean(value);
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Subscriber.create = function (next, error, complete) {
	        var subscriber = new Subscriber();
	        subscriber._next = (typeof next === 'function') && tryOrOnError_1.tryOrOnError(next) || noop_1.noop;
	        subscriber._error = (typeof error === 'function') && error || throwError_1.throwError;
	        subscriber._complete = (typeof complete === 'function') && complete || noop_1.noop;
	        return subscriber;
	    };
	    Subscriber.prototype.add = function (sub) {
	        // route add to the shared Subscription if it exists
	        var _subscription = this._subscription;
	        if (_subscription) {
	            _subscription.add(sub);
	        }
	        else {
	            _super.prototype.add.call(this, sub);
	        }
	    };
	    Subscriber.prototype.remove = function (sub) {
	        // route remove to the shared Subscription if it exists
	        if (this._subscription) {
	            this._subscription.remove(sub);
	        }
	        else {
	            _super.prototype.remove.call(this, sub);
	        }
	    };
	    Subscriber.prototype.unsubscribe = function () {
	        if (this._isUnsubscribed) {
	            return;
	        }
	        else if (this._subscription) {
	            this._isUnsubscribed = true;
	        }
	        else {
	            _super.prototype.unsubscribe.call(this);
	        }
	    };
	    Subscriber.prototype._next = function (value) {
	        var destination = this.destination;
	        if (destination.next) {
	            destination.next(value);
	        }
	    };
	    Subscriber.prototype._error = function (err) {
	        var destination = this.destination;
	        if (destination.error) {
	            destination.error(err);
	        }
	    };
	    Subscriber.prototype._complete = function () {
	        var destination = this.destination;
	        if (destination.complete) {
	            destination.complete();
	        }
	    };
	    Subscriber.prototype.next = function (value) {
	        if (!this.isUnsubscribed) {
	            this._next(value);
	        }
	    };
	    Subscriber.prototype.error = function (err) {
	        if (!this.isUnsubscribed) {
	            this._error(err);
	            this.unsubscribe();
	        }
	    };
	    Subscriber.prototype.complete = function () {
	        if (!this.isUnsubscribed) {
	            this._complete();
	            this.unsubscribe();
	        }
	    };
	    return Subscriber;
	})(Subscription_1.Subscription);
	exports.Subscriber = Subscriber;
	//# sourceMappingURL=Subscriber.js.map

/***/ },
/* 6 */
/***/ function(module, exports) {

	/* tslint:disable:no-empty */
	function noop() { }
	exports.noop = noop;
	//# sourceMappingURL=noop.js.map

/***/ },
/* 7 */
/***/ function(module, exports) {

	function throwError(e) { throw e; }
	exports.throwError = throwError;
	//# sourceMappingURL=throwError.js.map

/***/ },
/* 8 */
/***/ function(module, exports) {

	function tryOrOnError(target) {
	    function tryCatcher() {
	        try {
	            tryCatcher.target.apply(this, arguments);
	        }
	        catch (e) {
	            this.error(e);
	        }
	    }
	    tryCatcher.target = target;
	    return tryCatcher;
	}
	exports.tryOrOnError = tryOrOnError;
	//# sourceMappingURL=tryOrOnError.js.map

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var noop_1 = __webpack_require__(6);
	var Subscription = (function () {
	    function Subscription(_unsubscribe) {
	        this.isUnsubscribed = false;
	        if (_unsubscribe) {
	            this._unsubscribe = _unsubscribe;
	        }
	    }
	    Subscription.prototype._unsubscribe = function () {
	        noop_1.noop();
	    };
	    Subscription.prototype.unsubscribe = function () {
	        if (this.isUnsubscribed) {
	            return;
	        }
	        this.isUnsubscribed = true;
	        var unsubscribe = this._unsubscribe;
	        var subscriptions = this._subscriptions;
	        this._subscriptions = void 0;
	        if (unsubscribe) {
	            unsubscribe.call(this);
	        }
	        if (subscriptions != null) {
	            var index = -1;
	            var len = subscriptions.length;
	            while (++index < len) {
	                subscriptions[index].unsubscribe();
	            }
	        }
	    };
	    Subscription.prototype.add = function (subscription) {
	        // return early if:
	        //  1. the subscription is null
	        //  2. we're attempting to add our this
	        //  3. we're attempting to add the static `empty` Subscription
	        if (!subscription || (subscription === this) || (subscription === Subscription.EMPTY)) {
	            return;
	        }
	        var sub = subscription;
	        switch (typeof subscription) {
	            case 'function':
	                sub = new Subscription(subscription);
	            case 'object':
	                if (sub.isUnsubscribed || typeof sub.unsubscribe !== 'function') {
	                    break;
	                }
	                else if (this.isUnsubscribed) {
	                    sub.unsubscribe();
	                }
	                else {
	                    var subscriptions = this._subscriptions || (this._subscriptions = []);
	                    subscriptions.push(sub);
	                }
	                break;
	            default:
	                throw new Error('Unrecognized subscription ' + subscription + ' added to Subscription.');
	        }
	    };
	    Subscription.prototype.remove = function (subscription) {
	        // return early if:
	        //  1. the subscription is null
	        //  2. we're attempting to remove ourthis
	        //  3. we're attempting to remove the static `empty` Subscription
	        if (subscription == null || (subscription === this) || (subscription === Subscription.EMPTY)) {
	            return;
	        }
	        var subscriptions = this._subscriptions;
	        if (subscriptions) {
	            var subscriptionIndex = subscriptions.indexOf(subscription);
	            if (subscriptionIndex !== -1) {
	                subscriptions.splice(subscriptionIndex, 1);
	            }
	        }
	    };
	    Subscription.EMPTY = (function (empty) {
	        empty.isUnsubscribed = true;
	        return empty;
	    }(new Subscription()));
	    return Subscription;
	})();
	exports.Subscription = Subscription;
	//# sourceMappingURL=Subscription.js.map

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var SymbolShim_1 = __webpack_require__(11);
	/**
	 * rxSubscriber symbol is a symbol for retreiving an "Rx safe" Observer from an object
	 * "Rx safety" can be defined as an object that has all of the traits of an Rx Subscriber,
	 * including the ability to add and remove subscriptions to the subscription chain and
	 * guarantees involving event triggering (can't "next" after unsubscription, etc).
	 */
	exports.rxSubscriber = SymbolShim_1.SymbolShim.for('rxSubscriber');
	//# sourceMappingURL=rxSubscriber.js.map

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var root_1 = __webpack_require__(12);
	function polyfillSymbol(root) {
	    var Symbol = ensureSymbol(root);
	    ensureIterator(Symbol, root);
	    ensureObservable(Symbol);
	    ensureFor(Symbol);
	    return Symbol;
	}
	exports.polyfillSymbol = polyfillSymbol;
	function ensureFor(Symbol) {
	    if (!Symbol.for) {
	        Symbol.for = symbolForPolyfill;
	    }
	}
	exports.ensureFor = ensureFor;
	var id = 0;
	function ensureSymbol(root) {
	    if (!root.Symbol) {
	        root.Symbol = function symbolFuncPolyfill(description) {
	            return "@@Symbol(" + description + "):" + id++;
	        };
	    }
	    return root.Symbol;
	}
	exports.ensureSymbol = ensureSymbol;
	function symbolForPolyfill(key) {
	    return '@@' + key;
	}
	exports.symbolForPolyfill = symbolForPolyfill;
	function ensureIterator(Symbol, root) {
	    if (!Symbol.iterator) {
	        if (typeof Symbol.for === 'function') {
	            Symbol.iterator = Symbol.for('iterator');
	        }
	        else if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
	            // Bug for mozilla version
	            Symbol.iterator = '@@iterator';
	        }
	        else if (root.Map) {
	            // es6-shim specific logic
	            var keys = Object.getOwnPropertyNames(root.Map.prototype);
	            for (var i = 0; i < keys.length; ++i) {
	                var key = keys[i];
	                if (key !== 'entries' && key !== 'size' && root.Map.prototype[key] === root.Map.prototype['entries']) {
	                    Symbol.iterator = key;
	                    break;
	                }
	            }
	        }
	        else {
	            Symbol.iterator = '@@iterator';
	        }
	    }
	}
	exports.ensureIterator = ensureIterator;
	function ensureObservable(Symbol) {
	    if (!Symbol.observable) {
	        if (typeof Symbol.for === 'function') {
	            Symbol.observable = Symbol.for('observable');
	        }
	        else {
	            Symbol.observable = '@@observable';
	        }
	    }
	}
	exports.ensureObservable = ensureObservable;
	exports.SymbolShim = polyfillSymbol(root_1.root);
	//# sourceMappingURL=SymbolShim.js.map

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, global) {var objectTypes = {
	    'boolean': false,
	    'function': true,
	    'object': true,
	    'number': false,
	    'string': false,
	    'undefined': false
	};
	exports.root = (objectTypes[typeof self] && self) || (objectTypes[typeof window] && window);
	/* tslint:disable:no-unused-variable */
	var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
	var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
	var freeGlobal = objectTypes[typeof global] && global;
	if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
	    exports.root = freeGlobal;
	}
	//# sourceMappingURL=root.js.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)(module), (function() { return this; }())))

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Observable_1 = __webpack_require__(4);
	var fromEvent_1 = __webpack_require__(15);
	Observable_1.Observable.fromEvent = fromEvent_1.FromEventObservable.create;
	//# sourceMappingURL=fromEvent.js.map

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(4);
	var tryCatch_1 = __webpack_require__(16);
	var errorObject_1 = __webpack_require__(17);
	var Subscription_1 = __webpack_require__(9);
	var FromEventObservable = (function (_super) {
	    __extends(FromEventObservable, _super);
	    function FromEventObservable(sourceObj, eventName, selector) {
	        _super.call(this);
	        this.sourceObj = sourceObj;
	        this.eventName = eventName;
	        this.selector = selector;
	    }
	    FromEventObservable.create = function (sourceObj, eventName, selector) {
	        return new FromEventObservable(sourceObj, eventName, selector);
	    };
	    FromEventObservable.setupSubscription = function (sourceObj, eventName, handler, subscriber) {
	        var unsubscribe;
	        var tag = sourceObj.toString();
	        if (tag === '[object NodeList]' || tag === '[object HTMLCollection]') {
	            for (var i = 0, len = sourceObj.length; i < len; i++) {
	                FromEventObservable.setupSubscription(sourceObj[i], eventName, handler, subscriber);
	            }
	        }
	        else if (typeof sourceObj.addEventListener === 'function' && typeof sourceObj.removeEventListener === 'function') {
	            sourceObj.addEventListener(eventName, handler);
	            unsubscribe = function () { return sourceObj.removeEventListener(eventName, handler); };
	        }
	        else if (typeof sourceObj.on === 'function' && typeof sourceObj.off === 'function') {
	            sourceObj.on(eventName, handler);
	            unsubscribe = function () { return sourceObj.off(eventName, handler); };
	        }
	        else if (typeof sourceObj.addListener === 'function' && typeof sourceObj.removeListener === 'function') {
	            sourceObj.addListener(eventName, handler);
	            unsubscribe = function () { return sourceObj.removeListener(eventName, handler); };
	        }
	        subscriber.add(new Subscription_1.Subscription(unsubscribe));
	    };
	    FromEventObservable.prototype._subscribe = function (subscriber) {
	        var sourceObj = this.sourceObj;
	        var eventName = this.eventName;
	        var selector = this.selector;
	        var handler = selector ? function (e) {
	            var result = tryCatch_1.tryCatch(selector)(e);
	            if (result === errorObject_1.errorObject) {
	                subscriber.error(result.e);
	            }
	            else {
	                subscriber.next(result);
	            }
	        } : function (e) { return subscriber.next(e); };
	        FromEventObservable.setupSubscription(sourceObj, eventName, handler, subscriber);
	    };
	    return FromEventObservable;
	})(Observable_1.Observable);
	exports.FromEventObservable = FromEventObservable;
	//# sourceMappingURL=fromEvent.js.map

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var errorObject_1 = __webpack_require__(17);
	var tryCatchTarget;
	function tryCatcher() {
	    try {
	        return tryCatchTarget.apply(this, arguments);
	    }
	    catch (e) {
	        errorObject_1.errorObject.e = e;
	        return errorObject_1.errorObject;
	    }
	}
	function tryCatch(fn) {
	    tryCatchTarget = fn;
	    return tryCatcher;
	}
	exports.tryCatch = tryCatch;
	;
	//# sourceMappingURL=tryCatch.js.map

/***/ },
/* 17 */
/***/ function(module, exports) {

	exports.errorObject = { e: {} };
	//# sourceMappingURL=errorObject.js.map

/***/ }
/******/ ]);
//# sourceMappingURL=wsabi-client.js.map