// ===== KURAMOTO OSCILLATORS MODEL =====
// Network of coupled oscillators with synchronization dynamics

class KuramotoOscillatorsModel {
  constructor() {
    this.numOscillators = 200;
    this.oscillators = [];
    this.couplingStrength = 0.5;
    this.naturalFreqRange = 0.5;
    this.noiseStrength = 0.1;
    this.networkRadius = 0.8;
    
    // Visualization
    this.showNetwork = true;
    this.showWaves = true;
    this.waveAmplitude = 50;
    this.waveSpeed = 0.02;
    
    // Synchronization tracking
    this.orderParameter = 0;
    this.clusterCount = 0;
    this.lastSyncEvent = 0;
    this.eventCounter = 0;
    
    this.initialize();
  }

  initialize() {
    this.oscillators = [];
    
    for (let i = 0; i < this.numOscillators; i++) {
      const angle = (Math.PI * 2 * i) / this.numOscillators;
      const radius = 0.3 + Math.random() * 0.4;
      
      this.oscillators.push({
        phase: Math.random() * Math.PI * 2,
        naturalFreq: (Math.random() - 0.5) * this.naturalFreqRange,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        velocity: 0,
        cluster: 0,
        connections: []
      });
    }
    
    this.buildNetwork();
  }

  buildNetwork() {
    // Create small-world network connections
    for (let i = 0; i < this.numOscillators; i++) {
      this.oscillators[i].connections = [];
      
      for (let j = 0; j < this.numOscillators; j++) {
        if (i !== j) {
          const dx = this.oscillators[i].x - this.oscillators[j].x;
          const dy = this.oscillators[i].y - this.oscillators[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Connect if within radius or randomly (small-world)
          if (dist < this.networkRadius || Math.random() < 0.1) {
            this.oscillators[i].connections.push(j);
          }
        }
      }
    }
  }

  step() {
    // Calculate order parameter (global synchronization)
    const cosSum = this.oscillators.reduce((sum, osc) => sum + Math.cos(osc.phase), 0);
    const sinSum = this.oscillators.reduce((sum, osc) => sum + Math.sin(osc.phase), 0);
    this.orderParameter = Math.sqrt(cosSum * cosSum + sinSum * sinSum) / this.numOscillators;
    
    // Update each oscillator
    for (let i = 0; i < this.numOscillators; i++) {
      const osc = this.oscillators[i];
      
      // Calculate coupling term from connected oscillators
      let couplingTerm = 0;
      for (const j of osc.connections) {
        couplingTerm += Math.sin(this.oscillators[j].phase - osc.phase);
      }
      
      // Kuramoto equation
      const phaseVelocity = osc.naturalFreq + 
        (this.couplingStrength / osc.connections.length) * couplingTerm +
        (Math.random() - 0.5) * this.noiseStrength;
      
      osc.phase += phaseVelocity * 0.1;
      osc.velocity = phaseVelocity;
      
      // Keep phase in [0, 2π]
      osc.phase = ((osc.phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    }
    
    // Detect synchronization events
    return this.detectEvents();
  }

  detectEvents() {
    const currentTime = performance.now() / 1000.0;
    
    // Detect synchronization events
    if (this.orderParameter > 0.8 && currentTime - this.lastSyncEvent > 3.0) {
      this.lastSyncEvent = currentTime;
      this.eventCounter++;
      
      // Count clusters (groups of synchronized oscillators)
      this.clusterCount = this.countClusters();
      
      console.log(`Synchronization Event | Order: ${this.orderParameter.toFixed(3)}, Clusters: ${this.clusterCount}`);
      
      return {
        type: 'sync',
        orderParameter: this.orderParameter,
        clusterCount: this.clusterCount,
        couplingStrength: this.couplingStrength,
        naturalFreqRange: this.naturalFreqRange
      };
    }
    
    // Detect desynchronization events
    if (this.orderParameter < 0.3 && currentTime - this.lastSyncEvent > 2.0) {
      this.lastSyncEvent = currentTime;
      this.eventCounter++;
      
      console.log(`Desynchronization Event | Order: ${this.orderParameter.toFixed(3)}`);
      
      return {
        type: 'desync',
        orderParameter: this.orderParameter,
        couplingStrength: this.couplingStrength,
        naturalFreqRange: this.naturalFreqRange
      };
    }
    
    return null;
  }

  countClusters() {
    const visited = new Array(this.numOscillators).fill(false);
    let clusterCount = 0;
    
    for (let i = 0; i < this.numOscillators; i++) {
      if (!visited[i]) {
        this.dfsCluster(i, visited);
        clusterCount++;
      }
    }
    
    return clusterCount;
  }

  dfsCluster(node, visited) {
    visited[node] = true;
    
    for (const neighbor of this.oscillators[node].connections) {
      if (!visited[neighbor]) {
        const phaseDiff = Math.abs(this.oscillators[node].phase - this.oscillators[neighbor].phase);
        const normalizedDiff = Math.min(phaseDiff, Math.PI * 2 - phaseDiff) / Math.PI;
        
        // Consider synchronized if phase difference is small
        if (normalizedDiff < 0.2) {
          this.dfsCluster(neighbor, visited);
        }
      }
    }
  }

  draw() {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.3;
    
    // Background
    fill(248, 249, 250, 220);
    noStroke();
    rect(0, 0, width, height);
    
    // Draw network connections
    if (this.showNetwork) {
      stroke(220, 220, 220, 80);
      strokeWeight(1);
      noFill();
      
      for (let i = 0; i < this.numOscillators; i++) {
        const osc = this.oscillators[i];
        const x1 = centerX + osc.x * scale;
        const y1 = centerY + osc.y * scale;
        
        for (const j of osc.connections) {
          const other = this.oscillators[j];
          const x2 = centerX + other.x * scale;
          const y2 = centerY + other.y * scale;
          
          line(x1, y1, x2, y2);
        }
      }
    }
    
    // Draw oscillators
    for (let i = 0; i < this.numOscillators; i++) {
      const osc = this.oscillators[i];
      const x = centerX + osc.x * scale;
      const y = centerY + osc.y * scale;
      
      // Use Lotka-Volterra color scheme based on synchronization
      const syncLevel = this.orderParameter;
      const velocityIntensity = Math.abs(osc.velocity) * 0.5;
      
      if (syncLevel > 0.7) {
        // Synchronized: muted purple-gray (like prey)
        const alpha = 120 + velocityIntensity * 100;
        fill(162, 153, 158, alpha);
        stroke(162, 153, 158, 180);
      } else {
        // Desynchronized: muted red-brown (like predator)
        const alpha = 100 + velocityIntensity * 80;
        fill(132, 106, 106, alpha);
        stroke(132, 106, 106, 160);
      }
      
      strokeWeight(1);
      
      // Size based on velocity
      const size = 3 + Math.abs(osc.velocity) * 5;
      circle(x, y, size);
      
      // Draw phase indicator
      strokeWeight(2);
      const phaseX = x + Math.cos(osc.phase) * 8;
      const phaseY = y + Math.sin(osc.phase) * 8;
      line(x, y, phaseX, phaseY);
    }
    
    // Draw wave patterns
    if (this.showWaves) {
      this.drawWaves(centerX, centerY, scale);
    }
    
    // Draw info panel
    this.drawInfo();
  }

  drawWaves(centerX, centerY, scale) {
    noFill();
    stroke(162, 153, 158, 60);
    strokeWeight(1);
    
    // Draw concentric waves based on average phase
    const avgPhase = this.oscillators.reduce((sum, osc) => sum + osc.phase, 0) / this.numOscillators;
    const time = performance.now() * this.waveSpeed;
    
    for (let r = 20; r < scale * 2; r += 20) {
      beginShape();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const wavePhase = avgPhase + time + angle * 2;
        const amplitude = this.waveAmplitude * this.orderParameter;
        const waveRadius = r + Math.sin(wavePhase) * amplitude;
        
        const x = centerX + Math.cos(angle) * waveRadius;
        const y = centerY + Math.sin(angle) * waveRadius;
        vertex(x, y);
      }
      endShape(CLOSE);
    }
  }

  drawInfo() {
    push();
    fill(248, 249, 250, 220);
    stroke(220, 220, 220);
    strokeWeight(1);
    rect(10, 10, 250, 120, 8);
    
    fill(80, 80, 80);
    textSize(12);
    textAlign(LEFT);
    text(`Order Parameter: ${this.orderParameter.toFixed(3)}`, 20, 30);
    text(`Clusters: ${this.clusterCount}`, 20, 45);
    text(`Coupling: ${this.couplingStrength.toFixed(2)}`, 20, 60);
    text(`Freq Range: ${this.naturalFreqRange.toFixed(2)}`, 20, 75);
    text(`Events: ${this.eventCounter}`, 20, 90);
    text(`Oscillators: ${this.numOscillators}`, 20, 105);
    pop();
  }

  // Parameter setters
  setCouplingStrength(value) { 
    this.couplingStrength = value; 
  }
  
  setNaturalFreqRange(value) { 
    this.naturalFreqRange = value; 
  }
  
  setNoiseStrength(value) { 
    this.noiseStrength = value; 
  }
  
  setNetworkRadius(value) { 
    this.networkRadius = value; 
    this.buildNetwork(); // Rebuild network when radius changes
  }
  
  setNumOscillators(value) { 
    this.numOscillators = Math.max(10, Math.min(500, value)); 
    this.initialize(); 
  }
  
  setWaveAmplitude(value) { 
    this.waveAmplitude = value; 
  }
  
  toggleNetwork() { 
    this.showNetwork = !this.showNetwork; 
  }
  
  toggleWaves() { 
    this.showWaves = !this.showWaves; 
  }
  
  // Reset simulation
  reset() {
    this.initialize();
    this.eventCounter = 0;
    this.lastSyncEvent = 0;
  }
}

// Export for use in main script
window.KuramotoOscillatorsModel = KuramotoOscillatorsModel;
