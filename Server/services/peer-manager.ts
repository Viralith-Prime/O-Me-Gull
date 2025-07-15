import { WebSocket } from "ws";

export interface Client {
  id: string;
  ws: WebSocket;
  partnerId?: string;
  isWaiting: boolean;
}

export class PeerManager {
  private clients = new Map<string, Client>();
  private waitingQueue: string[] = [];

  addClient(id: string, ws: WebSocket): void {
    this.clients.set(id, {
      id,
      ws,
      isWaiting: false
    });
  }

  removeClient(id: string): void {
    const client = this.clients.get(id);
    if (client) {
      // Notify partner if exists
      if (client.partnerId) {
        const partner = this.clients.get(client.partnerId);
        if (partner && partner.ws.readyState === WebSocket.OPEN) {
          partner.ws.send(JSON.stringify({ type: 'partner-disconnected' }));
          partner.partnerId = undefined;
          partner.isWaiting = false;
        }
      }

      // Remove from waiting queue
      const waitingIndex = this.waitingQueue.indexOf(id);
      if (waitingIndex > -1) {
        this.waitingQueue.splice(waitingIndex, 1);
      }

      this.clients.delete(id);
    }
  }

  findPartner(clientId: string): string | null {
    const client = this.clients.get(clientId);
    if (!client) return null;

    // Add to waiting queue if not already waiting
    if (!client.isWaiting && !this.waitingQueue.includes(clientId)) {
      this.waitingQueue.push(clientId);
      client.isWaiting = true;
    }

    // Try to find a partner from the waiting queue (excluding self)
    const availableClients = this.waitingQueue.filter(id => 
      id !== clientId && this.clients.get(id)?.ws.readyState === WebSocket.OPEN
    );

    if (availableClients.length > 0) {
      const partnerId = availableClients[0];
      const partner = this.clients.get(partnerId);

      if (partner) {
        // Remove both clients from waiting queue
        this.waitingQueue = this.waitingQueue.filter(id => 
          id !== clientId && id !== partnerId
        );

        // Set up partnership
        client.partnerId = partnerId;
        client.isWaiting = false;
        partner.partnerId = clientId;
        partner.isWaiting = false;

        return partnerId;
      }
    }

    return null;
  }

  getClient(id: string): Client | undefined {
    return this.clients.get(id);
  }

  getPartner(clientId: string): Client | undefined {
    const client = this.clients.get(clientId);
    if (client?.partnerId) {
      return this.clients.get(client.partnerId);
    }
    return undefined;
  }

  disconnectPartners(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client?.partnerId) {
      const partner = this.clients.get(client.partnerId);
      
      if (partner) {
        // Notify partner
        if (partner.ws.readyState === WebSocket.OPEN) {
          partner.ws.send(JSON.stringify({ type: 'partner-disconnected' }));
        }
        
        // Reset partner state
        partner.partnerId = undefined;
        partner.isWaiting = false;
      }

      // Reset client state
      client.partnerId = undefined;
      client.isWaiting = false;
    }
  }

  getWaitingCount(): number {
    return this.waitingQueue.length;
  }
}
