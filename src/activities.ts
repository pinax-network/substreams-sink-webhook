import { Clock } from "substreams";

export async function postWebhook(message: any, clock: Clock, url: string, privateKey: string) {
  const body = JSON.stringify({message, clock});
  console.log("POST", url);
  // const response = await fetch(url, {
  //   body,
  //   method: 'POST',
  //   headers: {'Content-Type': 'application/json'}
  // });
  return true;
}