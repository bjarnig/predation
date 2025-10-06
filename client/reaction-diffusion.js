// ===== REACTION-DIFFUSION MODEL =====
// Gray-Scott reaction-diffusion system

class ReactionDiffusionModel {
  constructor() {
    this.width = 200;
    this.height = 200;
    this.scale = 2; // Display scale factor
    
    // Gray-Scott parameters
    this.f = 0.055;      // Feed rate
    this.k = 0.062;      // Kill rate
    this.da = 1.0;       // Diffusion rate A
    this.db = 0.5;       // Diffusion rate B
    
    // Simulation state
    this.gridA = [];
    this.gridB = [];
    this.nextA = [];
    this.nextB = [];
    
    // Event tracking
    this.eventCounter = 0;
    this.lastPatternChange = 0;
    
    this.initialize();
  }

  initialize() {
    // Initialize grids
    this.gridA = Array(this.height).fill().map(() => Array(this.width).fill(1.0));
    this.gridB = Array(this.height).fill().map(() => Array(this.width).fill(0.0));
    this.nextA = Array(this.height).fill().map(() => Array(this.width).fill(0.0));
    this.nextB = Array(this.height).fill().map(() => Array(this.width).fill(0.0));
    
    // Add some initial patterns
    this.addPattern();
  }

  addPattern() {
    // Add random circular patterns
    for (let i = 0; i < 3; i++) {
      const centerX = Math.floor(Math.random() * this.width);
      const centerY = Math.floor(Math.random() * this.height);
      const radius = 5 + Math.random() * 10;
      
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (dist < radius) {
            this.gridA[y][x] = 0.0;
            this.gridB[y][x] = 1.0;
          }
        }
      }
    }
  }

  step() {
    // Gray-Scott reaction-diffusion equations
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const a = this.gridA[y][x];
        const b = this.gridB[y][x];
        
        // Laplacian (diffusion)
        const laplacianA = this.laplacian(this.gridA, x, y);
        const laplacianB = this.laplacian(this.gridB, x, y);
        
        // Reaction terms
        const reaction = a * b * b;
        
        // Update equations
        this.nextA[y][x] = a + 
          this.da * laplacianA - 
          reaction + 
          this.f * (1 - a);
          
        this.nextB[y][x] = b + 
          this.db * laplacianB + 
          reaction - 
          (this.f + this.k) * b;
        
        // Clamp values
        this.nextA[y][x] = Math.max(0, Math.min(1, this.nextA[y][x]));
        this.nextB[y][x] = Math.max(0, Math.min(1, this.nextB[y][x]));
      }
    }
    
    // Swap grids
    [this.gridA, this.nextA] = [this.nextA, this.gridA];
    [this.gridB, this.nextB] = [this.nextB, this.gridB];
    
    // Check for interesting events
    return this.checkEvents();
  }

  laplacian(grid, x, y) {
    // 9-point stencil for Laplacian
    const center = grid[y][x] * -1;
    const sides = grid[y-1][x] + grid[y+1][x] + grid[y][x-1] + grid[y][x+1];
    const corners = grid[y-1][x-1] + grid[y-1][x+1] + grid[y+1][x-1] + grid[y+1][x+1];
    return (sides * 0.2 + corners * 0.05 + center) / 1.2;
  }

  checkEvents() {
    // Count active regions (where B > 0.1)
    let activeRegions = 0;
    let totalB = 0;
    let maxB = 0;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const b = this.gridB[y][x];
        totalB += b;
        maxB = Math.max(maxB, b);
        if (b > 0.1) activeRegions++;
      }
    }
    
    const avgB = totalB / (this.width * this.height);
    
    // Detect pattern changes
    const currentTime = performance.now() / 1000.0;
    if (currentTime - this.lastPatternChange > 2.0) {
      if (activeRegions > 1000 || maxB > 0.8) {
        this.lastPatternChange = currentTime;
        this.eventCounter++;
        
        console.log(`Pattern Event | Active: ${activeRegions}, Max: ${maxB.toFixed(3)}, Avg: ${avgB.toFixed(3)}`);
        
        return {
          type: 'pattern',
          activeRegions: activeRegions,
          maxB: maxB,
          avgB: avgB,
          f: this.f,
          k: this.k
        };
      }
    }
    
    return null;
  }

  draw() {
    const offsetX = (width - this.width * this.scale) / 2;
    const offsetY = (height - this.height * this.scale) / 2;
    
    // Background
    fill(248, 249, 250, 220);
    noStroke();
    rect(0, 0, width, height);
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const a = this.gridA[y][x];
        const b = this.gridB[y][x];
        
        // Use Lotka-Volterra color scheme
        const intensity = Math.min(1, b * 2);
        
        if (intensity > 0.1) {
          // Active regions: muted purple-gray (like prey)
          const alpha = 40 + intensity * 120;
          fill(162, 153, 158, alpha);
          noStroke();
          rect(
            offsetX + x * this.scale, 
            offsetY + y * this.scale, 
            this.scale, 
            this.scale
          );
        } else if (a > 0.3) {
          // A-rich regions: muted red-brown (like predator)
          const alpha = 30 + a * 80;
          fill(132, 106, 106, alpha);
          noStroke();
          rect(
            offsetX + x * this.scale, 
            offsetY + y * this.scale, 
            this.scale, 
            this.scale
          );
        }
      }
    }
    
    // Draw parameter info
    this.drawInfo(offsetX, offsetY);
  }

  drawInfo(x, y) {
    push();
    fill(248, 249, 250, 220);
    stroke(220, 220, 220);
    strokeWeight(1);
    rect(x, y, 200, 80, 8);
    
    fill(80, 80, 80);
    textSize(12);
    textAlign(LEFT);
    text(`f: ${this.f.toFixed(3)}`, x + 10, y + 20);
    text(`k: ${this.k.toFixed(3)}`, x + 10, y + 35);
    text(`Events: ${this.eventCounter}`, x + 10, y + 50);
    text(`Scale: ${this.scale}x`, x + 10, y + 65);
    pop();
  }

  // Parameter setters
  setF(value) { this.f = value; }
  setK(value) { this.k = value; }
  setDa(value) { this.da = value; }
  setDb(value) { this.db = value; }
  setScale(value) { this.scale = Math.max(1, Math.min(4, value)); }
  
  // Add new pattern
  addNewPattern() {
    this.addPattern();
  }
  
  // Reset simulation
  reset() {
    this.initialize();
    this.eventCounter = 0;
    this.lastPatternChange = 0;
  }
}

// Export for use in main script
window.ReactionDiffusionModel = ReactionDiffusionModel;
