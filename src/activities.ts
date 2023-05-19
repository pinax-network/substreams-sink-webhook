export async function postWebhook(message: any): Promise<string> {
  // const response = await fetch('http://httpbin.org/post', {
  //   body: JSON.stringify(message),
  //   method: 'POST',
  //   headers: {'Content-Type': 'application/json'}
  // });
  // const json = await response.json();
  return `POST webhook ${JSON.stringify(message)}`;
}