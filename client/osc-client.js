// ===== OSC CLIENT MODULE =====
// Handles WebSocket OSC communication with the bridge server

class OSCClient {
  constructor() {
    this.port = null;
    this.connected = false;
    this.statusElement = document.getElementById("status");
  }

  connect(url) {
    if (this.port) { 
      try { 
        this.port.close(); 
      } catch(e) {
        // ignore errors on close
      }
    }
    
    this.port = new osc.WebSocketPort({ url, metadata: true });
    
    this.port.on("ready", () => { 
      this.connected = true; 
      this.statusElement.textContent = "connected";
    });
    
    this.port.on("close", () => { 
      this.connected = false; 
      this.statusElement.textContent = "disconnected";
    });
    
    this.port.on("error", () => { 
      this.connected = false; 
      this.statusElement.textContent = "error";
    });
    
    this.port.open();
  }

  send(address, args) {
    if (!this.connected || !this.port) return;
    
    const oscMsg = { 
      address, 
      args: args.map(v => {
        if (typeof v === 'number') {
          return Number.isInteger(v) 
            ? { type: 'i', value: v }
            : { type: 'f', value: v };
        } else {
          return { type: 's', value: String(v) };
        }
      })
    };
    
    try { 
      this.port.send(oscMsg); 
    } catch(e) { 
      // Ignore send errors
    }
  }
}

// Export for use in main script
window.OSCClient = OSCClient;
