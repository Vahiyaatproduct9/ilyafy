import { configDotenv } from "dotenv";
import { createClient } from "redis";
configDotenv({
  quiet: true
})
const memory = createClient({
  username: process.env.REDIS_USER || '',
  password: process.env.REDIS_PASSWORD || '',
  socket: {
    host: process.env.REDIS_HOST || '',
    port: parseInt(process.env.REDIS_PORT || '443'),
  }
})
memory.on('error', error => console.log('Memory Error:', error));
export default memory;