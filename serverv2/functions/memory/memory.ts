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

  async joinRoom({ socketId, roomId }: { socketId: string, roomId: string }) {
    const memory = this.memory.multi();
    memory.set(`socket:${socketId}:room`, roomId);
    memory.sAdd(`room:${roomId}:sockets`, [socketId]);
    await memory.exec();
  }

  async leaveRoom({ socketId, roomId }: { socketId: string, roomId: string }) {
    const memory = this.memory.multi();
    memory.del(`socket:${socketId}:room`);
    memory.sRem(`room:${roomId}:sockets`, [socketId]);
    await memory.exec();
    const sockets = await this.getRoomSockets(roomId);
    if (sockets.length === 0) {
      this.delRoom(roomId);
      return null;
    }
    return sockets;
  }
  async delRoom(roomId: string) {
    const sockets = await this.getRoomSockets(roomId);
    const memory = this.memory.multi();
    for (const s of sockets) {
      memory.del(`socket:${s}:room`);
    }
    memory.del(`room:${roomId}:sockets`);
    memory.exec();
  }

  async getRoomSockets(roomId: string) {
    return await this.memory.sMembers(`room:${roomId}:sockets`);
  }
  async getSocketRoom(socketId: string) {
    return await this.memory.get(`socket:${socketId}:room`);
  }

  // async getSessionSockets(sessionId: string) {
  //   return await this.memory.sMembers(`session:${sessionId}:sockets`);
  // }

  // async joinSocket({ sessionId, socketId, roomId }: { sessionId: string, socketId: string, roomId: string }) {
  //   await this.memory.sAdd(`room:${roomId}:sockets`, [socketId]);
  //   await this.memory.sAdd(`session:${sessionId}:sockets`, [socketId]);
  // }

  // async leaveSocket({ sessionId, socketId, roomId }: { sessionId: string, socketId: string, roomId: string }) {
  //   await this.memory.sRem(`session:${sessionId}:sockets`, [socketId]);
  //   await this.memory.sRem(`room:${roomId}:sockets`, [socketId]);
  // }

}