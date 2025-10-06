// SuperCollider OSC Receiver for Lotka-Volterra Events
// Receives messages from the p5.js simulation via the OSC bridge

// Boot the server
s.boot;

// Create OSC receiver
(

var oscReceiver = OSCFunc({ |msg, time, addr, recvPort|
    // Print the full OSC message
    "OSC Message received:".postln;
    "  Address: %".format(msg[0]).postln;
    "  Args: %".format(msg[1..]).postln;
    "  Time: %".format(time).postln;
    "  From: %:%".format(addr.ip, addr.port).postln;
    "".postln; // Empty line for readability
}, '/event'); // Listen for messages on /event address

// Print startup message
"SuperCollider OSC Receiver Started".postln;
"Listening for /event messages on port 57120".postln;
"Ready to receive Lotka-Volterra events!".postln;
"".postln;

// Keep the receiver alive
oscReceiver;

)

// To stop receiving messages, run:
// oscReceiver.free;
