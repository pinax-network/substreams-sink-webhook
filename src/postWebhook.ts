export async function postWebhook(url: string, body: string, signature: string, timestamp: number) {
  const response = await fetch(url, {
    body,
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-signature-secp256k1": signature,
      "x-signature-timestamp": String(timestamp),
    },
  });
  return response.text();
}
