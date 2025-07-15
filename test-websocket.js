import WebSocket from 'ws';

// Test WebSocket connection and matchmaking
async function testWebSocketConnection() {
  const ws1 = new WebSocket('ws://localhost:5000/ws');
  const ws2 = new WebSocket('ws://localhost:5000/ws');
  
  let client1Id = null;
  let client2Id = null;
  
  ws1.on('open', () => {
    console.log('Client 1 connected');
  });
  
  ws1.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Client 1 received:', message);
    
    if (message.type === 'connected') {
      client1Id = message.clientId;
      console.log('Client 1 ID:', client1Id);
      
      // Send find-partner request
      setTimeout(() => {
        ws1.send(JSON.stringify({ type: 'find-partner' }));
      }, 500);
    }
    
    if (message.type === 'partner-found') {
      console.log('✓ Client 1 found partner:', message.partnerId);
    }
  });
  
  ws2.on('open', () => {
    console.log('Client 2 connected');
  });
  
  ws2.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Client 2 received:', message);
    
    if (message.type === 'connected') {
      client2Id = message.clientId;
      console.log('Client 2 ID:', client2Id);
      
      // Send find-partner request
      setTimeout(() => {
        ws2.send(JSON.stringify({ type: 'find-partner' }));
      }, 1000);
    }
    
    if (message.type === 'partner-found') {
      console.log('✓ Client 2 found partner:', message.partnerId);
      
      // Test chat message
      setTimeout(() => {
        ws2.send(JSON.stringify({ 
          type: 'chat-message', 
          message: 'Hello from Client 2!' 
        }));
      }, 1000);
    }
  });
  
  ws1.on('close', () => {
    console.log('Client 1 disconnected');
  });
  
  ws2.on('close', () => {
    console.log('Client 2 disconnected');
  });
  
  // Clean up after test
  setTimeout(() => {
    ws1.close();
    ws2.close();
    console.log('Test completed');
  }, 5000);
}

testWebSocketConnection().catch(console.error);