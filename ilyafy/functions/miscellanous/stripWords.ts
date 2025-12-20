export default (str: string) => {
  const threshold = 50;
  if (str.length < threshold) {
    return str;
  }
  return `${str.slice(0, threshold)}...`;
}