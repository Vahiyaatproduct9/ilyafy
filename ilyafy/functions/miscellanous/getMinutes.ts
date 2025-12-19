export function getDuration(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
export function getPosition(position: number, duration: number): number {
  return Math.round((position / duration) * 100);
}