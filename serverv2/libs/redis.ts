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
async function test() {
  await memory.connect();
  console.log('Memory Connected');
  await memory.sAdd('session:mobile', 'socket 1')
  console.log(await memory.sMembers('session:mobile'))
  await memory.sAdd('session:mobile', 'socket 2')
  console.log(await memory.sMembers('session:mobile'))
  await memory.hSet('user:1000', {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30
  });
  console.log(await memory.hGetAll('user:1000'));
  await memory.flushAll();
  await memory.quit();
}
test();
export default memory;