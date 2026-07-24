import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/ws',
})
export class GatewayService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    // Authenticate via token in handshake
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    if (!token) {
      client.disconnect();
      return;
    }

    // Store user mapping if userId provided in auth
    const userId = client.handshake.auth?.userId as string | undefined;
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
    }

    client.join(`user:${userId}`);
  }

  handleDisconnect(client: Socket) {
    // Clean up user socket mapping
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  // ---- Emit helpers ----

  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToAll(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  // ---- Domain events ----

  emitVisitorArrival(data: { visitorId: string; fullName: string; propertyId: string; propertyInfo?: string }) {
    this.emitToAll('visitor.arrival', data);
  }

  emitVisitorDeparture(data: { visitorId: string; fullName: string; propertyId: string }) {
    this.emitToAll('visitor.departure', data);
  }

  emitNewNotification(data: { userId: string; notification: Record<string, unknown> }) {
    this.emitToUser(data.userId, 'notification.new', data.notification);
  }
}
