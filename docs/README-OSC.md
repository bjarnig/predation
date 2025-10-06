# OSC Bridge Setup - Browser to SuperCollider

## The Problem
- Browsers can only send **WebSocket** (security restriction)
- SuperCollider receives **UDP OSC**
- You need a **bridge server** to convert between them

## Quick Start

### 1. Install Node.js dependencies
```bash
cd ~/Desktop
npm install
```

### 2. Start the bridge server
```bash
npm start
```

You should see:
```
🌉 OSC Bridge Server Running
📱 WebSocket: ws://localhost:8081 (for browser)
🎵 UDP: localhost:57120 (to SuperCollider)
```

### 3. Keep SuperCollider running
SuperCollider automatically listens on port **57120** for OSC messages.

### 4. Connect from your HTML page
Your browser will connect to `ws://localhost:8081` (already set in your HTML)

### 5. Test it!

**In SuperCollider:**
```supercollider
// Listen for a test message
OSCdef(\test, {|msg|
    "Received from browser: %".format(msg[1]).postln;
}, '/test');
```

**In Browser Console:**
```javascript
oscPort.send({address: "/test", args: [0.5]});
```

## Architecture

```
Browser (WebSocket) 
    ↓
ws://localhost:8081 (Bridge Server)
    ↓
UDP localhost:57120 (SuperCollider)
```

## Troubleshooting

**Connection failed?**
- Make sure the bridge server is running (`npm start`)
- Check that nothing else is using port 8081
- SuperCollider should be running

**Messages not received?**
- Check the bridge server console for message logs
- Verify SuperCollider is listening with `OSCFunc.trace(true)`

**Stop listening in SuperCollider:**
```supercollider
OSCFunc.trace(false);
```

## Sending from Browser

```javascript
// Send single value
oscPort.send({
    address: "/control/freq",
    args: [440]
});

// Send multiple values
oscPort.send({
    address: "/ndef/control",
    args: ["wfsaa", "amp", 0.5]
});
```

## Receiving in SuperCollider

See `OSC-Blueprint.scd` for examples!

```supercollider
OSCdef(\freqControl, {|msg|
    var freq = msg[1];
    "Frequency: %".format(freq).postln;
}, '/control/freq');
```
