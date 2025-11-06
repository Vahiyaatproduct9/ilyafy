import { spawn } from "child_process";
export default async () => {
  const test_ip = "https://ifconfig.me/ip";

  function normalize(line) {
    line = line.trim();
    if (!line) return null;
    if (
      line.startsWith("https://") ||
      line.startsWith("https://") ||
      line.startsWith("socks5://") ||
      line.startsWith("socks5h://")
    ) {
      return line;
    }
    return `socks5://${line}`;
  }
  async function getList() {
    const response = await fetch(
      "https://raw.githubusercontent.com/Firmfox/Proxify/main/proxies/socks5.txt"
    );
    if (!response.ok)
      throw new Error("Failed to get List :(" + response.status);
    const text = await response.text();
    return text.split("\n").map(normalize).filter(Boolean);
  }
  async function testProxy(url) {
    return new Promise((resolve) => {
      const isHttp = url.startsWith("http://") || url.startsWith("https://");
      const curlArg = isHttp
        ? ["-x", url]
        : ["--socks5-hostname", url.replace(/^socks5.\/\//, "")];
      const curl = spawn("curl", ["--max-time", "8", ...curlArg, test_ip], {
        stdio: ["ignore", "pipe", "pipe"],
      });
      let out = "";
      curl.stdout.on("data", (b) => (out += b.toString()));
      curl.stderr.on("data", (d) =>
        console.log("[proxy] stderr:", d.toString())
      );
      curl.on("error", () => resolve(false));
      curl.on("close", (code) => resolve(code === 0 && out.trim().length > 0));
    });
  }
  async function findWorkingProxy(list) {
    for (const item of list) {
      console.log("checking", item);
      try {
        const ok = await testProxy(item);
        if (ok) return item;
      } catch (e) {
        console.log("Exception: ", e);
      }
    }
    return null;
  }
  const list = await getList();
  console.log("total proxies: ", list.length);
  const proxy = await findWorkingProxy(list);
  if (!proxy) {
    console.error("Error reading proxy...");
    process.exit(1);
  }
  console.log("Using Proxy: ", proxy);
  return proxy;
};
