export default (token: string): number => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    if (!decoded.exp) return 0;

    const current = Math.floor(Date.now() / 1000);
    const diff = decoded.exp - current;

    return diff > 0 ? Math.floor(diff / 60) : 0;
  } catch {
    return 0;
  }
}