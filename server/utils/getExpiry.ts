export function getSecondsUntilNextUTCmidnight() {
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return Math.floor((nextMidnight.getTime() - now.getTime()) / 1000);
} 