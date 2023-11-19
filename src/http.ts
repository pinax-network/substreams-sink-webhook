import type { IncomingMessage, ServerResponse } from "http";

export function toText(res: ServerResponse<IncomingMessage>, data: any, status = 200) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  return res.end(data);
}

export function toJSON(res: ServerResponse<IncomingMessage>, data: any, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(data, null, 2));
}
