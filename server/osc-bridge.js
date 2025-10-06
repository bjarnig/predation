// OSC WebSocket to UDP Bridge Server
// Converts WebSocket OSC from browser to UDP OSC for SuperCollider

const osc = require("osc");
const WebSocket = require("ws");

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8081 });

// UDP port (for SuperCollider)
const oscUDP = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 57121,           // This server listens here
    remoteAddress: "127.0.0.1", 
    remotePort: 57120,          // SuperCollider listens here (default)
    metadata: true
});

// Open the UDP port
oscUDP.open();

console.log("OSC Bridge Server Running");
console.log("WebSocket: ws://localhost:8081 (for browser)");
console.log("UDP: localhost:57120 (to SuperCollider)");
console.log("Listening on: localhost:57121 (from SuperCollider)");

// Store connected WebSocket clients
const connectedClients = new Set();

// Handle WebSocket connections
wss.on("connection", function (socket) {
    console.log("Browser connected!");
    
    // Create OSC WebSocket port for this connection
    const socketPort = new osc.WebSocketPort({
        socket: socket,
        metadata: true
    });
    
    connectedClients.add(socketPort);
    
    // Forward messages from WebSocket → UDP (Browser → SuperCollider)
    socketPort.on("message", function (oscMsg) {
        console.log("Browser → SC:", oscMsg);
        oscUDP.send(oscMsg);
    });
    
    // Handle disconnection
    socket.on("close", function () {
        console.log("Browser disconnected");
        connectedClients.delete(socketPort);
    });
    
    socketPort.on("error", function (err) {
        console.error("WebSocket error:", err);
    });
});

// Forward messages from UDP → WebSocket (SuperCollider → Browser)
oscUDP.on("message", function (oscMsg) {
    console.log("SC → Browser:", oscMsg);
    // Broadcast to all connected clients
    connectedClients.forEach(function (client) {
        try {
            client.send(oscMsg);
        } catch (err) {
            console.error("Error sending to client:", err);
        }
    });
});

oscUDP.on("ready", function () {
    console.log("UDP port ready");
});

oscUDP.on("error", function (err) {
    console.error("UDP error:", err);
});
