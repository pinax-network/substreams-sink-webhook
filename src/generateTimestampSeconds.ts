export function generateTimestampSeconds(timestamp: Date) {
  return Math.floor(timestamp.valueOf() / 1000);
}
