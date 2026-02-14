const fs = require("fs");
const path = require("path");
const dgram = require("dgram");

// =============================================================================
// VANGUARD LINK: The Synapse (Guardian of Synergy - 639 Hz)
// =============================================================================

// Heuristic Discovery: Check known locations
const PATHS_TO_CHECK = [
  "/Users/michaelmataluni/repos/products/north-shore/northshore-voice-power", // User Provided
  path.resolve(
    __dirname,
    "../../../products/north-shore/northshore-voice-power",
  ), // Relative from development/scream/tools
  path.resolve(__dirname, "../../northshore-voice-power"), // Sibling case
];

let FOUND_PATH = null;
for (const p of PATHS_TO_CHECK) {
  if (fs.existsSync(p)) {
    FOUND_PATH = p;
    break;
  }
}

const MIND_PATH = FOUND_PATH || PATHS_TO_CHECK[0]; // Default to user path even if missing, for logging

const BODY_CONFIG = {
  ip: "239.255.77.77",
  port: 4010,
  sampleRate: 44100,
};

// Protocol Header: [SampleRate(0x81=44.1k), BitDepth(16), Channels(2), ChannelMask(3), Pad(0)]
const HEADER = Buffer.from([0x81, 16, 2, 0x03, 0x00]);
const CHUNK_SIZE = 1152;

const mode = process.argv[2];

console.log(`
[VANGUARD LINK] 
State: Active | Hz: 639
---------------------------
`);

function main() {
  switch (mode) {
    case "scan":
      scanMind();
      break;
    case "pulse":
      pulseBody();
      break;
    case "synapse":
      establishSynapse();
      break;
    default:
      console.log("Usage: node vanguard_link.js [scan|pulse|synapse]");
      console.log("  scan    : Locate the external Mind repo");
      console.log(
        "  pulse   : Send a 440Hz Sine Wave burst to the Body (Multicast)",
      );
      console.log("  synapse : Listen for the Body's heartbeat");
  }
}

// -----------------------------------------------------------------------------
// HABIT 6: SYNERGIZE (The Scan)
// -----------------------------------------------------------------------------
function scanMind() {
  console.log(`[SCAN] Searching for Mind...`);
  if (FOUND_PATH) {
    console.log(`[SUCCESS] Mind Repo Found at: ${FOUND_PATH}`);
    const pkgPath = path.join(FOUND_PATH, "package.json");
    try {
      if (fs.existsSync(pkgPath)) {
        const pkg = require(pkgPath);
        console.log(`[IDENTITY] Name: ${pkg.name}`);
        console.log(`[IDENTITY] Version: ${pkg.version}`);
        console.log("[LINK] The Mind is present. Convergence potential: HIGH.");
      } else {
        console.warn("[WARN] Repo exists but no package.json found.");
      }
    } catch (e) {
      console.warn(`[WARN] Could not read package.json: ${e.message}`);
    }
  } else {
    console.log(`[MISSING] Could not locate Mind in:`);
    PATHS_TO_CHECK.forEach((p) => console.log(`  - ${p}`));
    console.log("[ACTION] Running in Independent Body Mode.");
  }
}

// -----------------------------------------------------------------------------
// HABIT 1: BE PROACTIVE (The Pulse)
// -----------------------------------------------------------------------------
function pulseBody() {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

  // Generate 1 second of 440Hz Sine Wave (Stereo, 16-bit, 44.1kHz)
  // 44100 samples * 2 channels * 2 bytes = 176,400 bytes
  const frequency = 440;
  const duration = 2; // seconds
  const totalSamples = BODY_CONFIG.sampleRate * duration;

  console.log(
    `[PULSE] Generating ${duration}s of Pure Tone (${frequency}Hz)...`,
  );

  let buffer = Buffer.alloc(totalSamples * 4); // 4 bytes per stereo sample
  for (let i = 0; i < totalSamples; i++) {
    const t = i / BODY_CONFIG.sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t);
    const val = Math.max(-32767, Math.min(32767, sample * 32000)); // Volume scale

    // Write Little Endian Interleaved (Left + Right same)
    const offset = i * 4;
    buffer.writeInt16LE(val, offset); // Left
    buffer.writeInt16LE(val, offset + 2); // Right
  }

  // Packetize and Send
  socket.bind(() => {
    socket.setBroadcast(true);
    socket.setMulticastTTL(128);

    let sentBytes = 0;
    let packets = 0;

    const interval = setInterval(
      () => {
        if (sentBytes >= buffer.length) {
          clearInterval(interval);
          socket.close();
          console.log(`[PULSE] Complete. Sent ${packets} packets.`);
          return;
        }

        // Slice Payload
        const end = Math.min(sentBytes + CHUNK_SIZE, buffer.length);
        const chunk = buffer.subarray(sentBytes, end);

        // Construct Packet (Header + Payload)
        const packet = Buffer.concat([HEADER, chunk]);

        socket.send(packet, BODY_CONFIG.port, BODY_CONFIG.ip);

        sentBytes += end - sentBytes;
        packets++;

        // Simple visualizer
        if (packets % 10 === 0) process.stdout.write(".");
      },
      (CHUNK_SIZE / (BODY_CONFIG.sampleRate * 4)) * 1000,
    ); // Rough timing: ~6.5ms per packet
  });
}

// -----------------------------------------------------------------------------
// HABIT 5: SEEK FIRST TO UNDERSTAND (The Synapse)
// -----------------------------------------------------------------------------
function establishSynapse() {
  const server = dgram.createSocket({ type: "udp4", reuseAddr: true });

  server.bind(BODY_CONFIG.port, () => {
    try {
      server.addMembership(BODY_CONFIG.ip);
      console.log(
        `[SYNAPSE] Connected to Neural Net: ${BODY_CONFIG.ip}:${BODY_CONFIG.port}`,
      );
      console.log("[SYNAPSE] Waiting for signals (Press Ctrl+C to stop)...");
    } catch (e) {
      console.error(
        "[ERROR] Could not join multicast group. Are you connected to a network?",
      );
    }
  });

  let lastSequence = 0;

  server.on("message", (msg, rinfo) => {
    // Basic Packet Validation
    if (msg.length !== CHUNK_SIZE + HEADER.length) return; // Ignore noise

    // Visual Heartbeat
    process.stdout.write("♥ ");
  });
}

main();
