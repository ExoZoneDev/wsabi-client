import {WsabiSocket} from "./socket";
import {Observable} from "rxjs/Observable";

import "rxjs/add/observable/fromEvent";

export class WsabiClient {
  public static Promise = typeof(Promise) === "function" ? Promise : undefined;

  public socket: WsabiSocket;
  public liveUrl: string = "/live";
  public logging: boolean = true;

  private subscriptions: {
    [key: string]: Observable<any>
  } = {};

  constructor(url: string, autoConnect: boolean = true) {
    this.socket = new WsabiSocket(url);
    this.socket.on("reopen", () => {
      let slugs = Object.keys(this.subscriptions);
      for (let i = 0, len = slugs.length; i < len; i++) {
        this.put(this.liveUrl, {slug: slugs[i]});
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
            if (data[0].statusCode != 200) {
              reject(data[0]);
            } else {
              resolve(data);
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
          if (data[0].statusCode != 200) {
            reject(data[0]);
          } else {
            resolve(data);
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

  public live(slug: string): Observable<any> {
    if (!this.subscriptions.hasOwnProperty(slug)) {
      this.subscriptions[slug] = Observable.fromEvent(this.socket, slug);
      this.put(this.liveUrl, {slug: slug}).then((res) => {
        if (this.logging) {
          console.log("[Wsabi]", `[${slug}]`, res.message || res);
        }
      })
    }

    return this.subscriptions[slug];
  }
}
