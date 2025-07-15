import { WebSocket } from "ws";
import { PeerManager } from "./peer-manager";

export class SignalingService {
  constructor(private peerManager: PeerManager) {}

  handleMessage(clientId: string, ws: WebSocket, message: any): void {
    // Ensure client is registered
    if (!this.peerManager.getClient(clientId)) {
      this.peerManager.addClient(clientId, ws);
    }

    switch (message.type) {
      case 'find-partner':
        this.handleFindPartner(clientId, ws);
        break;
      
      case 'offer':
        this.forwardToPartner(clientId, message);
        break;
      
      case 'answer':
        this.forwardToPartner(clientId, message);
        break;
      
      case 'ice-candidate':
        this.forwardToPartner(clientId, message);
        break;
      
      case 'chat-message':
        this.forwardChatMessage(clientId, message.message);
        break;
      
      case 'end-chat':
        this.handleEndChat(clientId);
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleFindPartner(clientId: string, ws: WebSocket): void {
    const partnerId = this.peerManager.findPartner(clientId);
    
    if (partnerId) {
      const partner = this.peerManager.getClient(partnerId);
      
      if (partner && partner.ws.readyState === WebSocket.OPEN) {
        // Notify both clients that they found each other
        ws.send(JSON.stringify({ type: 'partner-found', partnerId }));
        partner.ws.send(JSON.stringify({ type: 'partner-found', partnerId: clientId }));
      }
    } else {
      // Client is now in waiting queue
      ws.send(JSON.stringify({ type: 'waiting-for-partner' }));
    }
  }

  private forwardToPartner(clientId: string, message: any): void {
    const partner = this.peerManager.getPartner(clientId);
    
    if (partner && partner.ws.readyState === WebSocket.OPEN) {
      partner.ws.send(JSON.stringify(message));
    }
  }

  private forwardChatMessage(clientId: string, messageText: string): void {
    const partner = this.peerManager.getPartner(clientId);
    
    if (partner && partner.ws.readyState === WebSocket.OPEN) {
      partner.ws.send(JSON.stringify({
        type: 'chat-message',
        message: messageText,
        timestamp: new Date().toISOString()
      }));
    }
  }

  private handleEndChat(clientId: string): void {
    this.peerManager.disconnectPartners(clientId);
  }
}
