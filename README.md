# 🐺 Predation

A real-time visualization and sonification system for dynamic systems, featuring predator-prey dynamics, reaction-diffusion patterns, and coupled oscillators. Events are streamed via OSC to SuperCollider for real-time audio synthesis.

![Lotka-Volterra Simulation](https://img.shields.io/badge/Model-Lotka--Volterra-blue)
![Reaction-Diffusion](https://img.shields.io/badge/Model-Reaction--Diffusion-purple)
![Kuramoto Oscillators](https://img.shields.io/badge/Model-Kuramoto%20Oscillators-green)
![OSC Bridge](https://img.shields.io/badge/Protocol-OSC-green)
![p5.js](https://img.shields.io/badge/Framework-p5.js-red)

## ✨ Features

- **Three Dynamic Systems**:
  - 🐰 **Lotka-Volterra**: Predator-prey dynamics with Gillespie SSA
  - 🌊 **Reaction-Diffusion**: Gray-Scott pattern formation
  - 🎵 **Kuramoto Oscillators**: Network synchronization dynamics
- **Real-time Visualization**: Phase space plots, time series, and heatmaps
- **OSC Integration**: Stream events to SuperCollider for audio synthesis
- **Interactive Controls**: Adjust parameters in real-time
- **Modular Architecture**: Clean separation of concerns

## 🏗️ Project Structure

```
├── client/                 # Frontend (p5.js + WebSocket OSC)
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Styling
│   ├── main.js           # Application orchestration
│   ├── osc-client.js     # OSC WebSocket client
│   ├── reaction-diffusion.js # Gray-Scott model
│   ├── kuramoto-oscillators.js # Kuramoto model
│   └── lotka-volterra.js # Lotka-Volterra model
├── server/                # Backend (Node.js OSC bridge)
│   ├── osc-bridge.js     # WebSocket ↔ UDP OSC bridge
│   └── package.json      # Node.js dependencies
├── docs/                  # Documentation
│   ├── lotka-osc-receiver.scd  # SuperCollider example
│   └── README-OSC.md     # OSC protocol documentation
└── README.md             # This file
```

## 🚀 Quick Start

### 1. Start the OSC Bridge Server

```bash
cd server
npm install
node osc-bridge.js
```

You should see:
```
🌉 OSC Bridge Server Running
📱 WebSocket: ws://localhost:8081 (for browser)
🎵 UDP: localhost:57120 (to SuperCollider)
👂 Listening on: localhost:57121 (from SuperCollider)
✅ UDP port ready
```

### 2. Open the Client

Open `client/index.html` in your web browser and click **"Connect OSC"**.

### 3. Start SuperCollider (Optional)

Load `docs/lotka-osc-receiver.scd` in SuperCollider to receive and print OSC events.

## 🎮 Usage

### Controls

- **Start/Stop**: Control simulation execution
- **Deviate**: Add random perturbation to populations (Lotka-Volterra)
- **Converge**: Reset to equilibrium values (Lotka-Volterra)
- **Parameters**: Adjust model parameters in real-time

### Models

#### 🐰 Lotka-Volterra (Predator-Prey)
- **X**: Prey population
- **Y**: Predator population  
- **a**: Prey birth rate
- **b**: Predation rate
- **c**: Predator death rate
- **Time Scale**: Simulation speed multiplier

#### 🌊 Reaction-Diffusion (Gray-Scott)
- **f**: Feed rate
- **k**: Kill rate
- **dA**: Diffusion rate A
- **dB**: Diffusion rate B
- **Scale**: Visualization scale

#### 🎵 Kuramoto Oscillators
- **Coupling Strength**: Network coupling intensity
- **Freq Range**: Natural frequency distribution
- **Noise**: Random perturbation strength
- **Network Radius**: Connection distance
- **Oscillators**: Number of oscillators

## 📡 OSC Protocol

Events are sent to `/event` with the following formats:

### Lotka-Volterra Events
```
/event lotka type X Y a b c
```
- `type`: 0=Prey Birth, 1=Predation, 2=Predator Death
- `X, Y`: Current populations
- `a, b, c`: Model parameters

### Reaction-Diffusion Events
```
/event reaction pattern activeRegions maxB avgB f k
```
- `activeRegions`: Number of active pattern regions
- `maxB`: Maximum B concentration
- `avgB`: Average B concentration
- `f, k`: Model parameters

### Kuramoto Oscillators Events
```
/event kuramoto sync|desync orderParameter clusterCount coupling freqRange
```
- `sync|desync`: Event type
- `orderParameter`: Global synchronization measure (0-1)
- `clusterCount`: Number of synchronized clusters
- `coupling`: Coupling strength parameter
- `freqRange`: Natural frequency range

## 🛠️ Development

### Architecture

The project uses a modular architecture:

- **`main.js`**: Application orchestration and UI handling
- **`osc-client.js`**: WebSocket OSC communication
- **`sandpile.js`**: Sandpile SOC simulation and rendering
- **`lotka-volterra.js`**: Lotka-Volterra simulation and visualization
- **`osc-bridge.js`**: WebSocket ↔ UDP OSC bridge server

### Adding New Models

1. Create a new model class in `client/`
2. Add UI controls in `index.html`
3. Wire up the model in `main.js`
4. Define OSC message format

### Dependencies

**Client**:
- p5.js (CDN)
- osc-browser (CDN)

**Server**:
- Node.js
- osc
- ws

## 🎵 SuperCollider Integration

The system sends throttled OSC events (every 4th event) to prevent overwhelming SuperCollider. Example usage:

```supercollider
// Load the example receiver
load("docs/lotka-osc-receiver.scd");

// Or create your own synthesis
OSCFunc({ |msg|
    var type = msg[1], x = msg[2], y = msg[3];
    // Map populations to synthesis parameters
    ~synth.set(\freq, x * 10, \amp, y * 0.01);
}, '/event');
```

## 📊 Visualization

### Lotka-Volterra
- **Left Panel**: Phase space (X vs Y trajectory)
- **Right Panel**: Population time series
- **Real-time**: Current state with glow effect

### Sandpile
- **Heatmap**: Cell heights with color coding
- **Avalanches**: Visualized as color changes

## 🔧 Configuration

### OSC Bridge
- **WebSocket Port**: 8081 (configurable in `osc-bridge.js`)
- **UDP Ports**: 57120 (to SC), 57121 (from SC)

### Throttling
- **Event Rate**: 1 in 4 events sent to OSC (configurable in `main.js`)
- **Animation**: Full speed (60fps) regardless of throttling

## 📝 License

MIT License - feel free to use in your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📚 References

- [Lotka-Volterra Equations](https://en.wikipedia.org/wiki/Lotka%E2%80%93Volterra_equations)
- [Gillespie Algorithm](https://en.wikipedia.org/wiki/Gillespie_algorithm)
- [Self-Organized Criticality](https://en.wikipedia.org/wiki/Self-organized_criticality)
- [OSC Protocol](https://opensoundcontrol.org/)
- [p5.js](https://p5js.org/)

---

**Built with ❤️ for the intersection of science, art, and sound**
