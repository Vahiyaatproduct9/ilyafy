import memory from "@libs/redis";
export default class Memory {
  memory: typeof memory;
  constructor() {
    this.memory = memory;
    memory.connect().then(() => {
      console.log('Memory Connected');
    })
      .catch((err) => {
        console.error('Memory Connection Error:', err)
      });
    memory.on('error', error => {
      console.log('Memory Error:', error)
      setInterval(() => {
        console.log('Reconnecting Memory...');
        memory.connect().then(() => {
          console.log('Memory Reconnected');
        })
      }, 5000);
    });
  };

  async joinRoom({ sessionId, socketId, roomId }: { sessionId: string, socketId: string, roomId: string }) {
    const memory = this.memory.multi();
    memory.sAdd(`session:${sessionId}:sockets`, [socketId]);
    memory.sAdd(`session:${sessionId}:rooms`, [roomId]);
    memory.sAdd(`room:${roomId}:sessions`, [sessionId]);
    memory.sAdd(`room:${roomId}:sockets`, [socketId]);
    await memory.exec();
  }

  async leaveRoom({ sessionId, socketId, roomId }: { sessionId: string, socketId: string, roomId: string }) {
    const memory = this.memory.multi();
    memory.sRem(`session:${sessionId}:sockets`, [socketId]);
    memory.sRem(`session:${sessionId}:rooms`, [roomId]);
    memory.sRem(`room:${roomId}:sessions`, [sessionId]);
    memory.sRem(`room:${roomId}:sockets`, [socketId]);
    await memory.exec();
  }

  async getRoomSockets(roomId: string) {
    return await this.memory.sMembers(`room:${roomId}:sockets`);
  }

  async getSessionSockets(sessionId: string) {
    return await this.memory.sMembers(`session:${sessionId}:sockets`);
  }

  // async joinSocket({ sessionId, socketId, roomId }: { sessionId: string, socketId: string, roomId: string }) {
  //   await this.memory.sAdd(`room:${roomId}:sockets`, [socketId]);
  //   await this.memory.sAdd(`session:${sessionId}:sockets`, [socketId]);
  // }

  // async leaveSocket({ sessionId, socketId, roomId }: { sessionId: string, socketId: string, roomId: string }) {
  //   await this.memory.sRem(`session:${sessionId}:sockets`, [socketId]);
  //   await this.memory.sRem(`room:${roomId}:sockets`, [socketId]);
  // }

}