import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { EventEmitter } from 'events';

export interface WebSocketMessage {
  type: string;
  data: unknown;
}

export interface WebSocketClient extends WebSocket {
  id: string;
  isAlive: boolean;
  employeeCode?: string;
}

interface WebSocketEvents {
  connection: (client: WebSocketClient) => void;
  message: (data: {
    client: WebSocketClient;
    message: WebSocketMessage;
  }) => void;
  error: (error: Error) => void;
  disconnect: (client: WebSocketClient) => void;
}

// Define event handlers for type safety
export class WebSocketUtil extends EventEmitter {
  public on<E extends keyof WebSocketEvents>(
    event: E,
    listener: WebSocketEvents[E],
  ): this {
    return super.on(event, listener);
  }

  public emit<E extends keyof WebSocketEvents>(
    event: E,
    ...args: Parameters<WebSocketEvents[E]>
  ): boolean {
    return super.emit(event, ...args);
  }

  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(port: number) {
    super();
    this.wss = new WebSocketServer({ port });
    console.log(`✅ WebSocket Server is running on port ${port}`);
    this.setupServer();
    this.startHeartbeat();
  }

  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const client = this.setupClient(ws, req);
      this.setupClientHandlers(client);
      console.log(`🔌 WebSocket client connected: ${client.id}`);
    });

    this.wss.on('error', (error: Error) => {
      console.error('❌ WebSocket server error:', error.message);
      this.emit('error', error);
    });
  }

  private setupClient(ws: WebSocket, req: IncomingMessage): WebSocketClient {
    const client = ws as WebSocketClient;
    client.id = this.generateClientId(req);
    client.isAlive = true;

    // Extract employee code from query parameters
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (token) {
      // TODO: Verify JWT token and extract employee code
      // For now, we'll store the token as employee code
      client.employeeCode = token;
    }

    this.clients.set(client.id, client);
    this.emit('connection', client);
    return client;
  }

  private setupClientHandlers(client: WebSocketClient): void {
    (client as WebSocket).on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.emit('message', { client, message });
      } catch (error) {
        if (error instanceof Error) {
          console.error('Failed to parse message:', error.message);
        }
        this.emit('error', new Error('Invalid message format'));
      }
    });

    (client as WebSocket).on('pong', () => {
      client.isAlive = true;
    });

    (client as WebSocket).on('close', () => {
      this.clients.delete(client.id);
      this.emit('disconnect', client);
      console.log(`🔌 WebSocket client disconnected: ${client.id}`);
    });

    (client as WebSocket).on('error', (error: Error) => {
      // Handle connection reset errors gracefully
      const errorAny = error as any;
      if (errorAny.code === 'ECONNRESET' || errorAny.errno === -104) {
        console.warn(`WebSocket client ${client.id} connection reset (handled gracefully):`, error.message);
        // Remove client and emit disconnect instead of error
        this.clients.delete(client.id);
        this.emit('disconnect', client);
        return;
      }
      console.error(`Client ${client.id} error:`, error.message);
      this.emit('error', error);
    });
  }

  private startHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (!client.isAlive) {
          (client as WebSocket).terminate();
          this.clients.delete(client.id);
          this.emit('disconnect', client);
          return;
        }

        client.isAlive = false;
        (client as WebSocket).ping();
      });
    }, 30000) as unknown as NodeJS.Timeout;
  }

  private generateClientId(req: IncomingMessage): string {
    const ip = req.socket.remoteAddress || 'unknown';
    const timestamp = Date.now();
    return `${ip}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send a message to a specific client
   * @param clientId Client ID
   * @param message Message to send
   */
  public sendTo(clientId: string, message: WebSocketMessage): boolean {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        console.warn(`⚠️ Client ${clientId} not found`);
        return false;
      }

      (client as WebSocket).send(JSON.stringify(message));
      console.log(`📤 Sent message to client ${clientId}:`, message.type);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Failed to send message:', error.message);
      }
      return false;
    }
  }

  /**
   * Broadcast a message to all connected clients
   * @param message Message to broadcast
   * @param excludeClientId Optional client ID to exclude
   */
  public broadcast(message: WebSocketMessage, excludeClientId?: string): void {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (excludeClientId && client.id === excludeClientId) {
        return;
      }
      try {
        (client as WebSocket).send(messageStr);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Failed to broadcast to client ${client.id}:`,
            error.message,
          );
        }
      }
    });
  }

  /**
   * Get the number of connected clients
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Close the WebSocket server
   */
  public close(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.clients.forEach((client) => {
      try {
        (client as WebSocket).terminate();
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Failed to terminate client ${client.id}:`,
            error.message,
          );
        }
      }
    });

    this.clients.clear();
    this.wss.close();
  }
}
