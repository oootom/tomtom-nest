import * as http from "http";

console.log("type.ts run");

export type Request = http.IncomingMessage;
export type Response = http.ServerResponse;
