import { WebSocketServer } from 'ws';

class WsHub {
  private server?: WebSocketServer;

  initialize(server: WebSocketServer) {
    this.server = server;
  }
}

export const wsHub = new WsHub();
