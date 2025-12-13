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
  localSockets: Map<string, Set<string>> = new Map();

  handleConnection(socket: Socket) {
    console.log('Client Connected: ', socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log('Client Disconnected: ', socket.id)
    for (const [roomId, sockets] of this.localSockets) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        this.memory.leaveRoom({
          roomId,
          sessionId: 'temp',
          socketId: socket.id,
        })
        this.server.to(roomId).emit('leave', { id: socket.id });
        console.log('Client Left Room: ', roomId);
        if (sockets.size === 0) {
          this.localSockets.delete(roomId);
        }
      }
    }
  }
  @SubscribeMessage('message')
  async pass(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string, userId: string; state: string, progress?: string, event?: object }
  ) {
    const room = this.localSockets.get(data.roomId);
    // console.log('local Sockets: ', this.localSockets);
    if (!room || !room.has(socket.id)) {
      console.log('socket id:', socket.id);
      console.log('room:', room);
      console.log('Socket not in room, ignoring message from socket: ', socket.id);
      return;
    }
    for (const s of room) {
      if (s === socket.id) continue;
      this.server.to(s).emit('message', data);
    }
    if (data.state !== 'heartbeat') {
      console.log('Message from socket ', socket.id, ': ', data);
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
      sessionId: verified.data?.name || 'temp',
      socketId: socket.id,
    })
    const room = this.localSockets.get(data.roomId);
    console.log('room:', room);
    if (!room) {
      console.log('No Room with this ID, creating room :', data.roomId);
      const newRoom = new Set<string>();
      newRoom.add(socket.id);
      this.localSockets.set(data.roomId, newRoom);
    } else {
      room.add(socket.id);
    }
    socket.join(data.roomId);
    console.log('Client Joined Room: ', verified.data?.name)
    this.server.to(data.roomId).emit('join', { id: socket.id, name: verified.data?.name || 'Unknown' });
  }
}