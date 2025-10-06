// ===== MAIN APPLICATION =====
// Orchestrates the simulation and UI

// Global state
let running = false;
let oscCounter = 0;
let oscClient;
let reactionModel;
let kuramotoModel;
let lotkaModel;

// UI elements
const $ = sel => document.querySelector(sel);
const modelSelect = $("#model");
const wsUrl = $("#wsurl");

// ===== INITIALIZATION =====
function setup() {
  createCanvas(920, 540);
  frameRate(60);
  
  // Initialize models
  reactionModel = new ReactionDiffusionModel();
  kuramotoModel = new KuramotoOscillatorsModel();
  lotkaModel = new LotkaVolterraModel();
  oscClient = new OSCClient();
  
  // Initialize models
  reactionModel.reset();
  kuramotoModel.reset();
  lotkaModel.reset();
  showControls();
  
  setupEventListeners();
  setupUI();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Control buttons
  $("#start").onclick = () => { 
    if (!running) { 
      running = true; 
      // Only schedule for Lotka-Volterra model
      if (modelSelect.value === 'lotka') {
        lotkaModel.schedule(); 
      }
    }
  };
  
  $("#stop").onclick = () => { 
    running = false; 
  };
  
  $("#deviate").onclick = () => {
    if (modelSelect.value === 'lotka') {
      // Create dramatic population shifts
      const deviationType = Math.random();
      
      if (deviationType < 0.3) {
        // Prey explosion (sudden increase)
        lotkaModel.X = Math.floor(lotkaModel.X * (2 + Math.random() * 2));
        lotkaModel.Y = Math.floor(lotkaModel.Y * (0.5 + Math.random() * 0.5));
        console.log("Prey explosion triggered!");
      } else if (deviationType < 0.6) {
        // Predator surge (sudden increase)
        lotkaModel.Y = Math.floor(lotkaModel.Y * (2 + Math.random() * 2));
        lotkaModel.X = Math.floor(lotkaModel.X * (0.5 + Math.random() * 0.5));
        console.log("Predator surge triggered!");
      } else if (deviationType < 0.8) {
        // Random perturbation to both populations
        lotkaModel.X += Math.floor((Math.random() - 0.5) * 40);
        lotkaModel.Y += Math.floor((Math.random() - 0.5) * 20);
        console.log("Random perturbation applied!");
      } else {
        // Parameter mutation (temporarily change rates)
        lotkaModel.a *= (0.5 + Math.random());
        lotkaModel.b *= (0.5 + Math.random());
        lotkaModel.c *= (0.5 + Math.random());
        console.log("Parameter mutation applied!");
      }
      
      // Ensure populations stay positive
      lotkaModel.X = Math.max(1, lotkaModel.X);
      lotkaModel.Y = Math.max(1, lotkaModel.Y);
      
      // Update UI sliders to reflect changes
      $("#lvX").value = lotkaModel.X;
      $("#lvX-val").textContent = lotkaModel.X;
      $("#lvY").value = lotkaModel.Y;
      $("#lvY-val").textContent = lotkaModel.Y;
      $("#lvA").value = lotkaModel.a;
      $("#lvA-val").textContent = lotkaModel.a.toFixed(2);
      $("#lvB").value = lotkaModel.b;
      $("#lvB-val").textContent = lotkaModel.b.toFixed(3);
      $("#lvC").value = lotkaModel.c;
      $("#lvC-val").textContent = lotkaModel.c.toFixed(2);
    }
  };
  
  $("#converge").onclick = () => {
    if (modelSelect.value === 'lotka') {
      // Calculate theoretical equilibrium
      const equilibriumX = lotkaModel.c / lotkaModel.b;
      const equilibriumY = lotkaModel.a / lotkaModel.b;
      
      // Smooth convergence to equilibrium
      lotkaModel.X = Math.floor(equilibriumX);
      lotkaModel.Y = Math.floor(equilibriumY);
      
      // Reset parameters to stable values
      lotkaModel.a = 0.8;
      lotkaModel.b = 0.015;
      lotkaModel.c = 0.6;
      lotkaModel.tScale = 1.0;
      
      console.log(`Converging to equilibrium: X=${equilibriumX.toFixed(1)}, Y=${equilibriumY.toFixed(1)}`);
      
      // Update UI sliders to reflect changes
      $("#lvX").value = lotkaModel.X;
      $("#lvX-val").textContent = lotkaModel.X;
      $("#lvY").value = lotkaModel.Y;
      $("#lvY-val").textContent = lotkaModel.Y;
      $("#lvA").value = lotkaModel.a;
      $("#lvA-val").textContent = lotkaModel.a.toFixed(2);
      $("#lvB").value = lotkaModel.b;
      $("#lvB-val").textContent = lotkaModel.b.toFixed(3);
      $("#lvC").value = lotkaModel.c;
      $("#lvC-val").textContent = lotkaModel.c.toFixed(2);
      $("#lvS").value = lotkaModel.tScale;
      $("#lvS-val").textContent = lotkaModel.tScale.toFixed(1);
    }
  };
  
  $("#addPattern").onclick = () => {
    if (modelSelect.value === 'reaction') {
      reactionModel.addNewPattern();
    }
  };
  
  $("#toggleNetwork").onclick = () => {
    if (modelSelect.value === 'kuramoto') {
      kuramotoModel.toggleNetwork();
    }
  };
  
  $("#toggleWaves").onclick = () => {
    if (modelSelect.value === 'kuramoto') {
      kuramotoModel.toggleWaves();
    }
  };
}

// ===== UI SETUP =====
function setupUI() {
  // OSC connection
  $("#connect").onclick = () => oscClient.connect(wsUrl.value);
  
  // Model selection
  modelSelect.onchange = showControls;
  
  // Reaction-Diffusion parameter bindings
  $("#rdF").oninput = e => { 
    reactionModel.setF(parseFloat(e.target.value)); 
    $("#rdF-val").textContent = e.target.value; 
  };
  
  $("#rdK").oninput = e => { 
    reactionModel.setK(parseFloat(e.target.value)); 
    $("#rdK-val").textContent = e.target.value; 
  };
  
  $("#rdDA").oninput = e => { 
    reactionModel.setDa(parseFloat(e.target.value)); 
    $("#rdDA-val").textContent = e.target.value; 
  };
  
  $("#rdDB").oninput = e => { 
    reactionModel.setDb(parseFloat(e.target.value)); 
    $("#rdDB-val").textContent = e.target.value; 
  };
  
  $("#rdScale").oninput = e => { 
    reactionModel.setScale(parseInt(e.target.value)); 
    $("#rdScale-val").textContent = e.target.value; 
  };

  // Kuramoto Oscillators parameter bindings
  $("#kuC").oninput = e => { 
    kuramotoModel.setCouplingStrength(parseFloat(e.target.value)); 
    $("#kuC-val").textContent = e.target.value; 
  };
  
  $("#kuF").oninput = e => { 
    kuramotoModel.setNaturalFreqRange(parseFloat(e.target.value)); 
    $("#kuF-val").textContent = e.target.value; 
  };
  
  $("#kuN").oninput = e => { 
    kuramotoModel.setNoiseStrength(parseFloat(e.target.value)); 
    $("#kuN-val").textContent = e.target.value; 
  };
  
  $("#kuR").oninput = e => { 
    kuramotoModel.setNetworkRadius(parseFloat(e.target.value)); 
    $("#kuR-val").textContent = e.target.value; 
  };
  
  $("#kuO").oninput = e => { 
    kuramotoModel.setNumOscillators(parseInt(e.target.value)); 
    $("#kuO-val").textContent = e.target.value; 
  };

  // Lotka-Volterra parameter bindings
  $("#lvX").oninput = e => { 
    lotkaModel.X = parseInt(e.target.value); 
    $("#lvX-val").textContent = e.target.value; 
  };
  
  $("#lvY").oninput = e => { 
    lotkaModel.Y = parseInt(e.target.value); 
    $("#lvY-val").textContent = e.target.value; 
  };
  
  $("#lvA").oninput = e => { 
    lotkaModel.a = parseFloat(e.target.value); 
    $("#lvA-val").textContent = e.target.value; 
  };
  
  $("#lvB").oninput = e => { 
    lotkaModel.b = parseFloat(e.target.value); 
    $("#lvB-val").textContent = e.target.value; 
  };
  
  $("#lvC").oninput = e => { 
    lotkaModel.c = parseFloat(e.target.value); 
    $("#lvC-val").textContent = e.target.value; 
  };
  
  $("#lvS").oninput = e => { 
    lotkaModel.tScale = parseFloat(e.target.value); 
    $("#lvS-val").textContent = e.target.value; 
  };
}

// ===== UI HELPERS =====
function showControls() {
  const isReaction = modelSelect.value === 'reaction';
  const isKuramoto = modelSelect.value === 'kuramoto';
  const isLotka = modelSelect.value === 'lotka';
  
  document.querySelectorAll('.rd').forEach(el => el.style.display = isReaction ? 'block' : 'none');
  document.querySelectorAll('.ku').forEach(el => el.style.display = isKuramoto ? 'block' : 'none');
  document.querySelectorAll('.lv').forEach(el => el.style.display = isLotka ? 'block' : 'none');
  
  // Show/hide model-specific buttons
  document.querySelectorAll('#deviate, #converge').forEach(el => el.style.display = isLotka ? 'inline-block' : 'none');
  document.querySelectorAll('#addPattern').forEach(el => el.style.display = isReaction ? 'inline-block' : 'none');
  document.querySelectorAll('#toggleNetwork, #toggleWaves').forEach(el => el.style.display = isKuramoto ? 'inline-block' : 'none');
}

// ===== MAIN RENDER LOOP =====
function draw() {
  background(255);
  
  // Render current model
  if (modelSelect.value === 'reaction') {
    reactionModel.draw();
  } else if (modelSelect.value === 'kuramoto') {
    kuramotoModel.draw();
  } else {
    lotkaModel.draw();
  }

  // Update simulation if running
  if (running) {
    const t = performance.now() / 1000.0;
    
    if (modelSelect.value === 'reaction') {
      const result = reactionModel.step();
      if (result) {
        // Send OSC event (throttled - every 10th event)
        oscCounter++;
        if (oscCounter % 10 === 0) {
          oscClient.send('/event', [
            'reaction', 
            'pattern', 
            result.activeRegions, 
            result.maxB, 
            result.avgB, 
            result.f, 
            result.k
          ]);
        }
      }
    }
    
    if (modelSelect.value === 'kuramoto') {
      const result = kuramotoModel.step();
      if (result) {
        // Send OSC event (throttled - every 10th event)
        oscCounter++;
        if (oscCounter % 10 === 0) {
          oscClient.send('/event', [
            'kuramoto', 
            result.type, 
            result.orderParameter, 
            result.clusterCount || 0, 
            result.couplingStrength, 
            result.naturalFreqRange
          ]);
        }
      }
    }
    
    if (modelSelect.value === 'lotka' && t >= lotkaModel.nextEventAt) { 
      const result = lotkaModel.eventStep();
      if (result) {
        // Send OSC event (throttled - every 10th event)
        oscCounter++;
        if (oscCounter % 10 === 0) {
          oscClient.send('/event', [
            'lotka', 
            result.type, 
            lotkaModel.X, 
            lotkaModel.Y, 
            lotkaModel.a, 
            lotkaModel.b, 
            lotkaModel.c
          ]);
        }
      }
      lotkaModel.schedule(); 
    }
  }
}
