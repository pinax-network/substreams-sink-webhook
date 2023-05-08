import type { Clock } from "substreams";

export async function postWebhook(message: any, clock: Clock, typeName: string, hash: string, manifest: string): Promise<string> {
  const data = {
    message,
    clock,
    typeName
  };
  const response = await fetch('http://httpbin.org/post', {
    body: JSON.stringify(data),
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  });
  const json = (await response.json()).json;
  return `POST webhook ${json.hash} ${JSON.stringify(json.message)}!`;
}

// const response = await postWebhook('a63bf736a39ac384ef038d92961ade52b90c5908', {text: 'Hello, Temporal!'})
// console.log(response);