export function generateTimestamp() {
  return Math.floor(Date.now().valueOf() / 1000);
}
