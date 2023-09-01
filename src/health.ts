import { URLSearchParams } from "url";
import { http, prometheus } from "substreams-sink"
import { banner } from './banner.js';
import type { IncomingMessage, ServerResponse } from "http";

export function health() {
    http.server.on("request", async (req, res) => {
        if (!req.url) return;
        const params = new URLSearchParams(req.url.split("?")[1] ?? "");
        try {
            if (req.method == "GET") {
                if ( req.url === "/") return toText(res, banner());
                if ( req.url === "/health" ) {
                    const messages = await getSingleMetric("substreams_sink_data_message")
                    if ( messages ) return toText(res, "OK");
                    return toText(res, "no messages received yet", 503);
                }
            }
            // throw new Error(`invalid request`);
        } catch (err: any) {
            res.statusCode = 400;
            return res.end(err.message);
        }
    });
}

async function getSingleMetric(name: string) {
    const metric = prometheus.registry.getSingleMetric(name)
    const get = await metric?.get()
    return get?.values[0].value
}

function toNoContent(res: ServerResponse<IncomingMessage>) {
    res.writeHead(204);
    return res.end();
}

function toText(res: ServerResponse<IncomingMessage>, data: any, status = 200) {
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(data);
}

function toJSON(res: ServerResponse<IncomingMessage>, data: any, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(data, null, 2));
}