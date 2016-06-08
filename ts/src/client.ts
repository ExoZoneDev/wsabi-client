import {WsabiSocket} from "./socket";
import {Observable} from "rxjs/Observable";

import "rxjs/add/observable/fromEvent";

export class WsabiClient {
  public static Promise = typeof Promise === "function" ? Promise : undefined;
  public static set WebSocket(ws: any) {
    WsabiSocket.WebSocket = ws;
  }

  public socket: WsabiSocket;
  public liveUrl: string = "/live"

  private subscriptions: {
    [key: string]: number
  } = {};

  constructor(url: string, autoConnect: boolean = true) {
    this.socket = new WsabiSocket(url);
    
    // Resub to live events on reconnect.
    this.socket.on("reopen", () => {
      let slugs = Object.keys(this.subscriptions);
      for (let i = 0, len = slugs.length; i < len; i++) {
        this.put(this.liveUrl, { slug: slugs[i] });
      }
    })

    if (autoConnect) {
      this.connect();
    }
  }

  public connect() {
    this.socket.connect();
  }

  public request(method: string, url: string, data: any = {}, headers: any = {}) {
    return new WsabiClient.Promise((resolve, reject) => {
      if (!this.socket.isConnected()) {
        this.socket.once("open", () => {
          this.socket.send([
            method,
            {
              method: method,
              headers: headers,
              url: url,
              data: data
            }
          ], (data) => {
            if (data[0].statusCode >= 200 && data[0].statusCode < 400) {
              resolve(data);
            } else {
              reject(data[0]);
            }
          });
        })
      } else {
        this.socket.send([
          method,
          {
            method: method,
            headers: headers,
            url: url,
            data: data
          }
        ], (data) => {
            if (data[0].statusCode >= 200 && data[0].statusCode < 400) {
              resolve(data);
            } else {
              reject(data[0]);
            }
        });
      }
    }).then(function (res) {
      return res[0];
    });
  }

  public get(url: string, headers: any = {}) {
    return this.request("get", url, {}, headers).then(function (res) {
      return res.body;
    });
  }

  public post(url: string, data: any, headers: any = {}) {
    return this.request("post", url, data, headers).then(function (res) {
      return res.body;
    });
  }

  public put(url: string, data: any, headers: any = {}) {
    return this.request("put", url, data, headers).then(function (res) {
      return res.body;
    });
  }

  public delete(url: string, data: any, headers: any = {}) {
    return this.request("delete", url, data, headers).then(function (res) {
      return res.body;
    });
  }

  public live(slug: string, listenConnect = false): Observable<any> {
    if (this.subscriptions[slug] == null) {
      this.subscriptions[slug] = 0;
    }
    return Observable.create(observer => {
      const updateCallback = data => observer.next(data);
      if (this.subscriptions[slug] === 0) {
        // Not yet subscribed
        this.put(this.liveUrl, { slug: slug })
          .then((res) => {
            if (listenConnect) {
              observer.next({
                isClient: true,
                message: "subscribed",
                data: res
              });
            }
            
            this.subscriptions[slug]++;
            this.socket.on(slug, updateCallback);
          })
          .catch(err => observer.error(err));
      } else {
        // Already subscribed, just listen for the event.
        if (listenConnect) {
          observer.next({
            isClient: true,
            message: "resubscribed"
          });
        }
        this.subscriptions[slug]++;
        this.socket.on(slug, updateCallback);
      }
      
      // Cleanup listener and delete subscription if last listener on unsub.
      return () => {
        this.subscriptions[slug]--;
        this.socket.removeListener(slug, updateCallback);
        
        if (this.subscriptions[slug] === 0) {
          this.delete(this.liveUrl, { slug: slug })
        }
      }
    });
  }
}
