# Wsabi Client
A lightweight client for the hapi websocket layer, wsabi.

This aims to be lightweight and avoids using large libraries such as sails.io.js and socket.io-client.
The footprint is currently 14.2 kB minified. This could be smaller but would require sacrificing the use of rxjs observables. I may consider providing a version that doesn't require that.

## Usage
```typescript
import {WsabiClient} from "wsabi-client";

// You can set the promise and websocket libraries the client will use.
// This is useful in environments that either don't support Promises, or
// environments such as NodeJS that don't provide a default WebSocket implementation.
import {WsabiSocket} from "wsabi-client";
WsabiSocket.WebSocket = require("ws");
WsabiClient.Promise = require("bluebird");

let wsabi = new WsabiClient("wss://localhost:3000");

// Set the live endpoint. Defaults to '/live'
wsabi.liveUrl = "/v1/live";

wsabi.socket.on("open", function () {
  console.log("Socket connection open!");
  
  // Send requests to the server with get, put, post, delete, or request.
  wsabi.get("/v1/user/current").then((res) => {
    // Subscribe to a live event
    wsabi.live(`user:${res.id}:update`).subscribe((res) => {
      console.log("User update!", res);
    })
  });
});
```