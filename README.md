# Wsabi Client
A lightweight client for the hapi websocket layer, wsabi.

This aims to be lightweight and avoids using large libraries such as sails.io.js and socket.io-client.
The footprint is currently 4.8 kB minified and gzipped.

## Usage
```typescript
import {WsabiClient} from "wsabi-client";

// You can set the promise and websocket libraries the client will use.
// This is useful in environments that either don't support Promises, or
// environments such as NodeJS that don't provide a default WebSocket implementation.
WsabiClient.WebSocket = require("ws");
WsabiClient.Promise = require("bluebird");

let wsabi = new WsabiClient("wss://localhost:3000");

// Set the live endpoint. Defaults to '/live'
wsabi.liveUrl = "/v1/live";
  
// Send requests to the server with get, put, post, delete, or request.
wsabi.get("/v1/user/current").then((res) => {
  // Subscribe to a live event
  let updateSub = wsabi.live(`user:${res.id}:update`).subscribe(
    update => console.log("User update!", update),
    err => console.error("There was an error subscribing", err)
  )
  
  // ...
  
  updateSub.unsubscribe();
});
```
