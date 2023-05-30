export async function postWebhook(url: string, body: string, signature: string, timestamp: string) {
  const response = await fetch(url, {
    body,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature-secp256k1': signature,
      'x-signature-timestamp': timestamp,
    }
  });
  return response.text();
}
