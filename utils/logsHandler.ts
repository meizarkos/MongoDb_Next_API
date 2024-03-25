import fs from "fs";
import events from "events";
import { type AddressInfo } from "net";
import { NextFunction, Request, Response } from "express";

export interface ILogEvent {
  time: Date;
  route: string;
  method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
  issuer: AddressInfo;
  payload?: string;
}

const LOGS_FILENAME = "logs.txt";
export const REQUEST_EVENT = "request";
const writeStream = fs.createWriteStream(LOGS_FILENAME, { flags: "a" });
export const logEventEmitter = new events.EventEmitter();

logEventEmitter.on(REQUEST_EVENT, (event: ILogEvent) => {
  writeStream.write(`Accepted request at: ${event.time.toISOString()}`);
  writeStream.write(` - method: ${event.method}`);
  writeStream.write(` - route: ${event.route}`);
  writeStream.write(`- issuer: ${JSON.stringify(event.issuer)}`);
  if (event.payload !== undefined) {
    writeStream.write(` - payload: ${event.payload}`);
  }
  writeStream.write("\n");
});

export default function emitLogEventMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logEventEmitter.emit(REQUEST_EVENT, {
    time: new Date(),
    route: req.route,
    method: req.method,
    issuer: req.ip,
    payload: req.body,
  });

  next();
}
