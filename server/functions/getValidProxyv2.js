import { spawn } from "child_process";
import { configDotenv } from "dotenv";
configDotenv({
  path: "./.env",
});
async function getValidProxy() {
  async function getList() {
    const url = process.env.PROXY_LINK;
    const res = await fetch(url);
    const response = await res.text();

    function normalize(link) {
      if (!link) return;
      link = link.split(":");
      if (link.length === 5) {
        return `${link[0]}\/\/${link[3]}:${link[4]}@${
          link[1].startsWith("//") ? link[1].replace("//", "") : link[1]
        }:${link[2]}`;
      }
      return `socks5://${link[2]}:${link[3].replace("\r", "")}@${link[0]}:${
        link[1]
      }`;
    }
    return response.split("\n").map(normalize).filter(Boolean);
  }
  async function testUrl(url) {
    return new Promise((resolve) => {
      const isHttp = url.startsWith("http://") || url.startsWith("https://");
      const curlArg = isHttp
        ? ["-x", url]
        : ["--socks5-hostname", url.replace(/^socks5.\/\//, "")];
      const curl = spawn(
        "curl",
        ["--max-time", "8", ...curlArg, "https://ifconfig.me/ip"],
        {
          stdio: ["ignore", "pipe", "pipe"],
        }
      );
      let out = "";
      curl.stdout.on("data", (d) => (out += d.toString()));
      curl.stderr.on("data", (d) =>
        console.log("[proxy] stderr:", d.toString())
      );
      curl.on("error", () => resolve(false));
      curl.on("close", (code) => resolve(code === 0 && out.trim().length > 0));
    });
  }
  const response = await getList();
  for (const ip of response) {
    console.log("checking : ", ip);
    try {
      const ok = await testUrl(ip);
      if (ok) return ip;
      break;
      // if (ok) console.log(ip);
      // return;
    } catch (e) {
      console.log("Error in loop:", e);
    }
  }
  return null;
}
export default getValidProxy;
