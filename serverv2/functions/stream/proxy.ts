import { configDotenv } from "dotenv"

configDotenv({});

const secret = process.env.PROXY_SAMPLE || '';
let count = 0;
export default () => {
  function normalize(link) {
    if (!link) return;
    link = link.split(":");
    if (link.length === 5) {
      return `${link[0]}//${link[3]}:${link[4]}@${link[1].startsWith("//") ? link[1].replace("//", "") : link[1]
        }:${link[2]}`;
    }
    return `socks5://${link[2]}:${link[3].replace("\r", "")}@${link[0]}:${link[1]
      }`;
  }
  const proxy_list = secret.split("\n").map(normalize).filter(Boolean);
  const proxy_link = proxy_list[proxy_list.length > count ? count : count & proxy_list.length]
  count++;
  console.log(proxy_link)
  return proxy_link;
}