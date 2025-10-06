// ===== LOTKA-VOLTERRA MODEL =====
// Gillespie Stochastic Simulation Algorithm (SSA)

class LotkaVolterraModel {
  constructor() {
    this.X = 60;        // Prey population
    this.Y = 25;        // Predator population
    this.a = 0.8;       // Prey birth rate
    this.b = 0.015;     // Predation rate
    this.c = 0.6;       // Predator death rate
    this.tScale = 1.0;  // Time scale factor
    this.nextEventAt = 0;
    this.history = [];
    this.phaseHistory = [];
  }

  reset() {
    this.nextEventAt = performance.now() / 1000.0 + 0.1;
  }

  schedule() {
    // Compute reaction propensities
    const rBirth = this.a * Math.max(0, this.X);
    const rPred = this.b * Math.max(0, this.X) * Math.max(0, this.Y);
    const rDeath = this.c * Math.max(0, this.Y);
    const total = rBirth + rPred + rDeath;
    
    if (total <= 0) { 
      this.nextEventAt = performance.now() / 1000.0 + 0.25; 
      return; 
    }
    
    const mean = 1.0 / total;
    const dt = this.expRand(mean) * this.tScale;
    this.nextEventAt = performance.now() / 1000.0 + dt;
  }

  eventStep() {
    // Compute reaction propensities
    const rBirth = this.a * Math.max(0, this.X);
    const rPred = this.b * Math.max(0, this.X) * Math.max(0, this.Y);
    const rDeath = this.c * Math.max(0, this.Y);
    const total = rBirth + rPred + rDeath;
    
    if (total <= 0) return null;
    
    // Select reaction based on propensities
    const rand = Math.random();
    const pBirth = rBirth / total;
    const pPred = rPred / total;
    
    let type;
    let eventName;
    
    if (rand < pBirth) { 
      this.X += 1; 
      type = 0; 
      eventName = "Prey Birth";
    } else if (rand < pBirth + pPred) { 
      this.X = Math.max(0, this.X - 1); 
      this.Y += 1; 
      type = 1; 
      eventName = "Predation";
    } else { 
      this.Y = Math.max(0, this.Y - 1); 
      type = 2; 
      eventName = "Predator Death";
    }

    console.log(`${eventName} | Prey: ${this.X}, Predators: ${this.Y}`);
    
    return { type, eventName };
  }

  draw() {
    // Initialize history arrays
    if (!this.history) { 
      this.history = []; 
    }
    if (!this.phaseHistory) { 
      this.phaseHistory = []; 
    }
    
    // Add current state to history
    const now = performance.now() / 1000.0;
    this.history.push({ t: now, X: this.X, Y: this.Y });
    this.phaseHistory.push({ X: this.X, Y: this.Y });
    
    // Trim history to maintain reasonable size
    const cutoff = now - 30; // 30 second window
    this.history = this.history.filter(p => p.t >= cutoff);
    if (this.phaseHistory.length > 500) {
      this.phaseHistory.shift();
    }
    
    // Layout: Phase space (left) and time series (right)
    const margin = 30;
    const phaseW = width * 0.45 - margin * 1.5;
    const phaseH = height - margin * 2 - 50;
    const phaseX = margin;
    const phaseY = margin;
    
    const timeW = width * 0.55 - margin * 1.5;
    const timeH = height - margin * 2 - 50;
    const timeX = width * 0.45 + margin;
    const timeY = margin;
    
    this.drawPhaseSpace(phaseX, phaseY, phaseW, phaseH);
    this.drawTimeSeries(timeX, timeY, timeW, timeH, cutoff, now);
  }

  drawPhaseSpace(x, y, w, h) {
    push();
    // Background box
    fill(248, 249, 250, 220);
    stroke(220, 220, 220);
    strokeWeight(1);
    rect(x, y, w, h, 8);
    
    // Grid
    stroke(230, 230, 230);
    strokeWeight(1);
    for (let i = 0; i <= 4; i++){
      const gx = x + (w * i / 4);
      const gy = y + (h * i / 4);
      line(gx, y, gx, y + h);
      line(x, gy, x + w, gy);
    }
    
    // Determine max values for scaling
    const maxX = Math.max(100, ...this.phaseHistory.map(p => p.X)) * 1.1;
    const maxY = Math.max(100, ...this.phaseHistory.map(p => p.Y)) * 1.1;
    
    // Draw phase trajectory with fade effect
    noFill();
    for (let i = 1; i < this.phaseHistory.length; i++){
      const p1 = this.phaseHistory[i-1];
      const p2 = this.phaseHistory[i];
      const alpha = map(i, 0, this.phaseHistory.length, 60, 200);
      
      stroke(162, 153, 158, alpha);
      strokeWeight(map(i, 0, this.phaseHistory.length, 1, 2.5));
      
      const x1 = map(p1.X, 0, maxX, x + 10, x + w - 10);
      const y1 = map(p1.Y, 0, maxY, y + h - 10, y + 10);
      const x2 = map(p2.X, 0, maxX, x + 10, x + w - 10);
      const y2 = map(p2.Y, 0, maxY, y + h - 10, y + 10);
      
      line(x1, y1, x2, y2);
    }
    
    // Current position with glow
    if (this.phaseHistory.length > 0){
      const curr = this.phaseHistory[this.phaseHistory.length - 1];
      const cx = map(curr.X, 0, maxX, x + 10, x + w - 10);
      const cy = map(curr.Y, 0, maxY, y + h - 10, y + 10);
      
      // Glow effect
      for (let r = 16; r > 0; r -= 3){
        fill(162, 153, 158, 150 / r * 3);
        noStroke();
        circle(cx, cy, r);
      }
      
      fill(162, 153, 158);
      stroke(255, 255, 255);
      strokeWeight(2);
      circle(cx, cy, 6);
    }
    
    // Labels
    noStroke();
    fill(80, 80, 80);
    textSize(11);
    textAlign(LEFT);
    text('Phase Space (Prey vs Predators)', x + 8, y + 14);
    textAlign(CENTER);
    text('Prey (X) →', x + w/2, y + h + 22);
    push();
    translate(x - 18, y + h/2);
    rotate(-HALF_PI);
    text('Predators (Y) →', 0, 0);
    pop();
    pop();
  }

  drawTimeSeries(x, y, w, h, cutoff, now) {
    push();
    // Background box
    fill(248, 249, 250, 220);
    stroke(220, 220, 220);
    strokeWeight(1);
    rect(x, y, w, h, 8);
    
    // Grid
    stroke(230, 230, 230);
    strokeWeight(1);
    for (let i = 0; i <= 4; i++){
      const gx = x + (w * i / 4);
      const gy = y + (h * i / 4);
      line(gx, y, gx, y + h);
      line(x, gy, x + w, gy);
    }
    
    const maxPop = Math.max(50, this.X, this.Y, ...this.history.map(p => Math.max(p.X, p.Y))) * 1.2;
    
    // Draw prey (X) with fill
    fill(162, 153, 158, 40);
    stroke(162, 153, 158, 180);
    strokeWeight(2);
    beginShape();
    vertex(x, y + h);
    for (const p of this.history){
      const tx = map(p.t, cutoff, now, x, x + w);
      const ty = map(p.X, 0, maxPop, y + h, y);
      vertex(tx, ty);
    }
    vertex(x + w, y + h);
    endShape(CLOSE);
    
    // Draw predators (Y) with fill
    fill(132, 106, 106, 40);
    stroke(132, 106, 106, 180);
    strokeWeight(2);
    beginShape();
    vertex(x, y + h);
    for (const p of this.history){
      const tx = map(p.t, cutoff, now, x, x + w);
      const ty = map(p.Y, 0, maxPop, y + h, y);
      vertex(tx, ty);
    }
    vertex(x + w, y + h);
    endShape(CLOSE);
    
    // Labels and legend
    noStroke();
    fill(80, 80, 80);
    textSize(11);
    textAlign(LEFT);
    text('Population over Time', x + 8, y + 14);
    
    // Legend
    fill(162, 153, 158);
    circle(x + 12, y + h + 18, 8);
    fill(60, 60, 60);
    text(`Prey: ${this.X}`, x + 22, y + h + 22);
    
    fill(132, 106, 106);
    circle(x + w/2 + 12, y + h + 18, 8);
    fill(60, 60, 60);
    text(`Predators: ${this.Y}`, x + w/2 + 22, y + h + 22);
    
    pop();
  }

  expRand(mean) {
    return -Math.log(1 - Math.random()) * mean;
  }
}

// Export for use in main script
window.LotkaVolterraModel = LotkaVolterraModel;
