import Memory from '@functions/memory/memory';
import { verifyToken } from '@functions/secret/JWT';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket

} from '@nestjs/websockets'
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class SessionGateway {

  @WebSocketServer()
  server: Server;
  memory: Memory = new Memory();
  // localSockets: Map<string, Set<string>> = new Map();

  handleConnection(socket: Socket) {
    console.log('Client Connected: ', socket.id);
  }
  async handleDisconnect(socket: Socket) {
    try {
      const roomId = await this.memory.getSocketRoom(socket.id);
      if (!roomId) return;
      await this.memory.leaveRoom({
        roomId,
        socketId: socket.id,
      });
      this.server.in(roomId).emit('leave', { id: socket.id });
      // if (roomSockets) {
      //   for (const s of roomSockets) {
      //     this.server.to(s).emit('leave', { id: socket.id });
      //   }
      // }
    } catch (error) {
      console.error('Error in handleDisconnect:', error);
    }
  }
  @SubscribeMessage('message')
  async pass(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    try {
      const roomId = await this.memory.getSocketRoom(socket.id);
      if (!roomId) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }

      if (data.state === 'heartbeat') {
        const onlineCount = (await socket.in(roomId).fetchSockets()).length;
        data = { ...data, online: onlineCount > 1 };
      }
      socket.broadcast.to(roomId).emit('message', data);
    } catch (error) {
      console.error('Error in pass:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('join')
  async onJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { accessToken: string, roomId: string }
  ) {
    const verified = verifyToken(data.accessToken);
    if (!verified || !verified?.success) {
      console.log('Invalid Token, disconnecting socket: ', socket.id);
      socket.emit('reject', {
        success: false,
        message: 'Invalid Authentication!'
      })
      socket.disconnect();
      return;
    }
    await this.memory.joinRoom({
      roomId: data.roomId,
      socketId: socket.id,
    })
    socket.join(data.roomId);
    console.log('Client Joined Room: ', verified.data?.name)
    this.server.in(data.roomId).emit('join', { id: socket.id, name: verified.data?.name || 'Unknown' });
  }
}