const dgram = require("dgram");

// CONFIGURATION
const MULTICAST_ADDR = "239.255.77.77";
const PORT = 4010;

const client = dgram.createSocket({ type: "udp4", reuseAddr: true });

console.log(`
[VANGUARD MONITOR] SPECTRUM ANALYZER
Target: ${MULTICAST_ADDR}:${PORT}
------------------------------------
Waiting for signal...
`);

client.on("listening", () => {
  try {
    client.setMulticastLoopback(true);
    client.addMembership(MULTICAST_ADDR);
    const address = client.address();
    console.log(`[BOUND] ${address.address}:${address.port}`);
  } catch (e) {
    console.log("Error adding membership: " + e.message);
  }
});

let packetBuffer = [];
const BUFFER_LIMIT = 15; // Process every ~100ms (15 packets)

client.on("message", (msg) => {
  // 5 byte header
  if (msg.length < 1157) return;

  // Extract Payload (last 1152 bytes)
  const payload = msg.subarray(5);

  // Convert to samples
  const samples = [];
  for (let i = 0; i < payload.length; i += 2) {
    samples.push(payload.readInt16LE(i));
  }

  packetBuffer.push(samples);

  if (packetBuffer.length >= BUFFER_LIMIT) {
    renderFrame();
    packetBuffer = [];
  }
});

function renderFrame() {
  // Flatten samples
  const allSamples = packetBuffer.flat();

  // 1. RMS (Root Mean Square) - Energy
  let sumSquares = 0;
  let zeroCrossings = 0;
  let lastSign = Math.sign(allSamples[0]);

  for (let i = 0; i < allSamples.length; i++) {
    const s = allSamples[i];
    sumSquares += s * s;

    const sign = Math.sign(s);
    if (sign !== 0 && sign !== lastSign) {
      zeroCrossings++;
      lastSign = sign;
    }
  }

  const rms = Math.sqrt(sumSquares / allSamples.length);
  const calibration = 15000; // Calibrate for visual range

  // 2. Visualization
  const barWidth = 40;
  const ratio = Math.min(rms / calibration, 1.0);
  const fill = Math.floor(ratio * barWidth);
  const empty = barWidth - fill;

  const bar = "=".repeat(fill) + ".".repeat(empty);

  // 3. ZCR (Zero Crossing Rate) - Rough Frequency
  // Duration of captured samples:
  const durationSec = allSamples.length / 2 / 44100; // Stereo div 2
  const zcrHz = Math.floor(zeroCrossings / 2 / durationSec / 2); // Approximation

  console.log(`[${bar}] E: ${(ratio * 100).toFixed(0)}% | ZCR: ${zcrHz}Hz`);
}

// BIND TO PORT IS CRITICAL FOR MULTICAST
client.bind(PORT);
