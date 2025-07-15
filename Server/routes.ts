import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { PeerManager } from "./services/peer-manager";
import { SignalingService } from "./services/signaling";
import { AISwarmSystem } from "./services/ai-swarm-system";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create WebSocket server on /ws path to avoid conflicts with Vite HMR
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });

  const peerManager = new PeerManager();
  const signalingService = new SignalingService(peerManager);
  const aiSwarm = new AISwarmSystem();
  
  // Activate AI Swarm Intelligence (async)
  aiSwarm.activateSwarm().catch(error => {
    console.error('Failed to activate AI Swarm:', error);
  });
  
  // API endpoint for swarm intelligence
  app.get('/api/swarm/status', (req, res) => {
    res.json({
      intelligence: aiSwarm.getSwarmIntelligence(),
      agents: aiSwarm.getAgentStatus(),
      report: aiSwarm.getSwarmReport()
    });
  });
  
  app.post('/api/swarm/optimize', (req, res) => {
    const { command } = req.body;
    const result = aiSwarm.processOptimizationCommand(command || 'optimize-performance');
    res.json({ result, timestamp: Date.now() });
  });

  // Test Suite API endpoints
  app.get('/api/test-suite/status', (req, res) => {
    const testAgent = aiSwarm.getTestSuiteAgent();
    res.json(testAgent.getTestResults());
  });

  app.post('/api/test-suite/run', (req, res) => {
    const testAgent = aiSwarm.getTestSuiteAgent();
    testAgent.runFullTestSuite();
    res.json({ message: 'Test suite initiated', timestamp: Date.now() });
  });

  app.get('/api/test-suite/quick-status', (req, res) => {
    const testAgent = aiSwarm.getTestSuiteAgent();
    res.json(testAgent.getQuickStatus());
  });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('Client connected to WebSocket from:', req.socket.remoteAddress);
    
    const clientId = Math.random().toString(36).substring(7);
    console.log('Assigned client ID:', clientId);
    
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message from client:', clientId, message);
        signalingService.handleMessage(clientId, ws, message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    ws.on('close', (code, reason) => {
      console.log('Client disconnected from WebSocket:', clientId, 'Code:', code, 'Reason:', reason.toString());
      peerManager.removeClient(clientId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket server error for client:', clientId, error);
    });

    // Send initial connection confirmation
    try {
      if (ws.readyState === WebSocket.OPEN) {
        const confirmMessage = JSON.stringify({ type: 'connected', clientId });
        console.log('Sending connection confirmation:', confirmMessage);
        ws.send(confirmMessage);
      }
    } catch (error) {
      console.error('Failed to send connection confirmation:', error);
    }
  });

  return httpServer;
}
