const dgram = require("dgram");
const { Buffer } = require("buffer");

// =============================================================================
// LOVE STREAM: The Abundant Signal
// =============================================================================

const CONFIG = {
  ip: "239.255.77.77",
  port: 4010,
  sampleRate: 44100,
  channels: 2,
  bitDepth: 16,
};

// Protocol Constants
const CHUNK_SIZE = 1152; // PCM Payload bytes
const HEADER = Buffer.from([0x81, 16, 2, 0x03, 0x00]); // 44.1k, 16b, 2ch
const SAMPLES_PER_CHUNK = CHUNK_SIZE / 2 / 2; // 1152 / 2 bytes / 2 channels = 288 samples

// Frequencies
const VERITAS_HZ = 432;
const LOVE_HZ = 528;
const CONNECTION_HZ = 639;

// The 10 STEPS OF FLOW
const STEPS = [
  "Be Aware",
  "Live in Flow",
  "See the Truth",
  "Share your Joy",
  "Hear the SiGNAL",
  "Experience Unity",
  "Return the Favor",
  "Forget the Past",
  "Lock Fucking iN",
  "Complete Loop",
];

// State
let stepIndex = 0;
let phase = 0;
let time = 0; // In seconds
let connectionPhase = 0;
const STEP_DURATION = 5; // Seconds per step
const PACKET_INTERVAL_MS = (SAMPLES_PER_CHUNK / CONFIG.sampleRate) * 1000; // ~6.53ms

// Socket Setup
const server = dgram.createSocket({ type: "udp4", reuseAddr: true });

console.log(`
[LOVE STREAM]
--------------------------------
Target: ${CONFIG.ip}:${CONFIG.port}
Signal: ${VERITAS_HZ}Hz + ${LOVE_HZ}Hz (Love & Truth)
Flow: Imminent
--------------------------------
`);

server.bind(() => {
  server.setBroadcast(true);
  server.setMulticastTTL(128);
  try {
    server.addMembership(CONFIG.ip);
  } catch (e) {
    // Ignore if already member or interface issues
  }

  console.log("[LOVE STREAM] Igniting the Heart...");
  startFlow();
  startStreaming();
});

// Flow Logic
function startFlow() {
  updateStep();
  setInterval(updateStep, STEP_DURATION * 1000);
}

function updateStep() {
  const currentStep = STEPS[stepIndex];
  console.log(`[FLOW] Step ${stepIndex + 1}: ${currentStep}`);
  stepIndex = (stepIndex + 1) % STEPS.length;
}

// Audio Generation & Streaming logic
function startStreaming() {
  let nextPacketTime = Date.now();

  function loop() {
    const now = Date.now();

    // Catch up if falling behind, but don't blocking-loop too much
    let packetsToSend = 0;
    while (now >= nextPacketTime) {
      sendChunk();
      nextPacketTime += PACKET_INTERVAL_MS;
      packetsToSend++;
      if (packetsToSend > 10) {
        // Reset if too far behind to avoid burst
        nextPacketTime = now + PACKET_INTERVAL_MS;
        break;
      }
    }

    // Schedule next check
    const delay = Math.max(0, nextPacketTime - Date.now());
    setTimeout(loop, delay);
  }

  loop();
}

function sendChunk() {
  const buffer = Buffer.alloc(CHUNK_SIZE);

  // connection wave logic (gentle fade in/out every now and then)
  // Let's make it pulse with the step? or just a slow sine LFO
  const connectionAmp = ((Math.sin(time * 0.5) + 1) / 2) * 0.15; // 0 to 0.15

  for (let i = 0; i < SAMPLES_PER_CHUNK; i++) {
    const t = time + i / CONFIG.sampleRate;

    // Synthesis
    let sample = 0;

    // Base Tones
    sample += Math.sin(2 * Math.PI * VERITAS_HZ * t) * 0.3;
    sample += Math.sin(2 * Math.PI * LOVE_HZ * t) * 0.3;

    // Harmonic/Connection (Occasional)
    sample += Math.sin(2 * Math.PI * CONNECTION_HZ * t) * connectionAmp;

    // Modulation (Pulse)
    // 0.1Hz pulse (10 seconds)
    const pulse = (Math.sin(2 * Math.PI * 0.1 * t) + 1.5) / 2.5; // modulate amp slightly
    sample *= pulse;

    // Convert to 16-bit
    const s16 = Math.max(-32767, Math.min(32767, sample * 32767));

    // Write Stereo (Left + Right same for now, maybe phase shift later if asked)
    buffer.writeInt16LE(Math.floor(s16), i * 4); // Left
    buffer.writeInt16LE(Math.floor(s16), i * 4 + 2); // Right
  }

  time += SAMPLES_PER_CHUNK / CONFIG.sampleRate;

  // Construct Packet
  const packet = Buffer.concat([HEADER, buffer]);

  // Send
  server.send(packet, CONFIG.port, CONFIG.ip, (err) => {
    if (err) console.error(err);
  });
}
