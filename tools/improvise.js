const dgram = require("dgram");

// CONFIG
const CONFIG = {
  ip: "239.255.77.77",
  port: 4010,
  sampleRate: 44100,
  payloadSize: 1152,
  header: Buffer.from([0x81, 0x10, 0x02, 0x03, 0x00]), // 44.1k, 16bit, Stereo, Mask
};

// STATE
const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
let isPlaying = true;
let startTime = Date.now();
let packetsSent = 0;
const packetDuration = (CONFIG.payloadSize / 4 / CONFIG.sampleRate) * 1000; // ms per packet

// SYNTH STATE
let phaseL = 0;
let phaseR = 0;
let freqBase = 432; // Start with Veritas
let freqTarget = 528; // Aim for Love
let modPhase = 0;
let currentMood = "Emergence";

// LOGGING
let lastLogTime = 0;
const logInterval = 2000; // ms

// Setup Socket
socket.bind(0, () => {
  socket.setBroadcast(true);
  socket.setMulticastTTL(128);
  try {
    socket.addMembership(CONFIG.ip);
  } catch (e) {
    // Ignore if fails (e.g. on some OSes sender can't join)
  }

  console.log(
    `[IMPROVISE] Connecting to the Stage (${CONFIG.ip}:${CONFIG.port})...`,
  );
  console.log(`[IMPROVISE] Header: ${CONFIG.header.toString("hex")}`);
  console.log(`[IMPROVISE] "Love improve. Yes, AND... THAT!"`);

  tick();
});

function tick() {
  if (!isPlaying) return;

  const now = Date.now();
  const timeElapsed = now - startTime;
  const expectedPackets = timeElapsed / packetDuration;

  if (packetsSent < expectedPackets) {
    // We are behind, send a packet (or catch up multiple if needed, but lets limit to 1 per loop to avoid blocking)
    sendPacket();

    // If still behind, schedule immediate next
    // But to prevent blocking event loop, we use setImmediate
    if (packetsSent < expectedPackets) {
      setImmediate(tick);
    } else {
      setTimeout(tick, 1);
    }
  } else {
    // We are ahead, wait slightly
    const delay = (packetsSent + 1) * packetDuration - timeElapsed;
    setTimeout(tick, Math.max(1, delay));
  }
}

function sendPacket() {
  const payload = Buffer.alloc(CONFIG.payloadSize);
  const sampleCount = CONFIG.payloadSize / 4; // 288 samples (Stereo 16-bit)

  for (let i = 0; i < sampleCount; i++) {
    // SYNTHESIS ENGINE: "Love Emerge" (Harmonic FM + Warmth)

    // 1. Smooth Frequency Glide (Gravity towards 432/528)
    freqBase += (freqTarget - freqBase) * 0.0005; // Slower, smoother drift

    // 2. Harmonic FM
    modPhase += 0.01; // Slower modulation
    // Harmonic ratios (3/2, 5/4) create warmth
    const modulator =
      Math.sin(modPhase * 2) * 20 + Math.sin(modPhase * 0.5) * 5;

    // Stereo "Drift" (Polyrhythmic/Binaural)
    // 528Hz vs 532Hz creates a "shimmer" (4Hz beat)
    const drift = Math.sin(Date.now() / 10000) * 2;

    // Yes AND... add the drift to the core
    const freqL = freqBase + modulator + drift;
    const freqR = freqBase + modulator - drift; // Stereo separation

    // 3. Phase Accumulation
    phaseL += (freqL / CONFIG.sampleRate) * 2 * Math.PI;
    phaseR += (freqR / CONFIG.sampleRate) * 2 * Math.PI;

    // 4. Waveform Generation (Pure Sine + Saturation)
    let sampL = Math.sin(phaseL);
    let sampR = Math.sin(phaseR);

    // Add warmth (Tube saturation emulation - soft clipping)
    sampL = Math.tanh(sampL * 1.5) * 0.8;
    sampR = Math.tanh(sampR * 1.5) * 0.8;

    // Minimal "Glitter" (High frequency low amplitude sparkle) instead of dirty noise
    if (Math.random() < 0.005) {
      sampL += (Math.random() - 0.5) * 0.1;
      sampR += (Math.random() - 0.5) * 0.1;
    }

    // Convert to Int16
    const intL = Math.floor(sampL * 30000);
    const intR = Math.floor(sampR * 30000);

    // Write samples (Little Endian)
    payload.writeInt16LE(intL, i * 4);
    payload.writeInt16LE(intR, i * 4 + 2);
  }

  // Construct Packet
  const packet = Buffer.concat([CONFIG.header, payload]);

  // Send
  socket.send(packet, CONFIG.port, CONFIG.ip, (err) => {
    if (err) console.error(err);
  });

  packetsSent++;

  // Log "Art"
  const now = Date.now();
  if (now - lastLogTime > logInterval) {
    const vibes = [
      "Hypnotic",
      "Brave", // Replacing Aggressive
      "Ethereal",
      "Poly-Free", // Replacing Schizophrenic
      "Sub-Bass",
      "Smiiling",
      "Laughing",
      "No Rules",
    ];

    // Occasional Joyful Interjection
    let message = "";
    if (Math.random() < 0.15) {
      const joys = [
        "Eating Mangos...",
        "Margaritas in the morning...",
        "Sunlight on water...",
        "Breathing deep...",
        "Yes, AND!",
        "Finding the flow...",
      ];
      message = joys[Math.floor(Math.random() * joys.length)];
    } else {
      const vibe = vibes[Math.floor(Math.random() * vibes.length)];
      message = `Vibe: ${vibe}`;
    }

    console.log(
      `[IMPROVISE] ${currentMood}: ${Math.floor(freqBase)}Hz | ${message} | Packets: ${packetsSent}`,
    );
    lastLogTime = now;
  }
}

// Direction Logic
setInterval(
  () => {
    // Gravitational pull to Love (528) and Veritas (432)
    const targets = [432, 528, 432, 528, 432, 528, 639];
    freqTarget = targets[Math.floor(Math.random() * targets.length)];

    // New Moods
    const modes = [
      "Floating",
      "Synthesizing",
      "Emergence", // "Love Emerge"
      "Harmonic Convergence",
      "Phase Aligning",
    ];
    currentMood = modes[Math.floor(Math.random() * modes.length)];
  },
  4000 + Math.random() * 3000,
);

// Handle Exit
process.on("SIGINT", () => {
  console.log("\n[IMPROVISE] Bowing to the audience. Love prevails.");
  socket.close();
  process.exit();
});
