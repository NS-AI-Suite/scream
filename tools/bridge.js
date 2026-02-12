const fs = require("fs");
const dgram = require("dgram");
const { spawn } = require("child_process");
const path = require("path");

// =============================================================================
// VANGUARD BRIDGE: The Local Nexus
// =============================================================================

// Default Configuration (The Standard)
const CONFIG = {
  ip: "239.255.77.77",
  port: 4010,
  file: null, // If null, use Stdin
  verbose: false,
};

// Argument Parsing (Manual, Dependency-Free)
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case "--ip":
      CONFIG.ip = args[++i];
      break;
    case "--port":
      CONFIG.port = parseInt(args[++i], 10);
      break;
    case "--file":
      CONFIG.file = args[++i];
      break;
    case "--verbose":
    case "-v":
      CONFIG.verbose = true;
      break;
    case "--help":
    case "-h":
      console.log(`
Usage: node bridge.js [options]

Options:
  --ip <address>    Multicast Group (default: 239.255.77.77)
  --port <number>   Port (default: 4010)
  --file <path>     Input file (MP3/WAV/etc). If omitted, reads from Stdin.
  --verbose         Show detailed packet logs.
      `);
      process.exit(0);
      break;
  }
}

// Validation
if (!CONFIG.ip || !CONFIG.port) {
  console.error("[ERROR] Invalid Configuration");
  process.exit(1);
}

// Constants
const CHUNK_SIZE = 1152; // PCM Payload
const HEADER_SIZE = 5;
// Header: [SampleRateMarker(129), BitDepth(16), Channels(2), ChannelMask(3), 0]
const HEADER = Buffer.from([129, 16, 2, 0x03, 0x00]);

// System State
const server = dgram.createSocket({ type: "udp4", reuseAddr: true });
let sequence = 0;
let bytesSent = 0;

console.log(`
[VANGUARD BRIDGE]
--------------------------------
Target: ${CONFIG.ip}:${CONFIG.port}
Source: ${CONFIG.file ? CONFIG.file : "Stdin (Pipe)"}
Protocol: 44.1kHz / 16-bit / Stereo
--------------------------------
`);

// Bind Socket
server.bind(() => {
  server.setBroadcast(true);
  server.setMulticastTTL(128);
  try {
    server.addMembership(CONFIG.ip);
  } catch (e) {
    if (CONFIG.verbose)
      console.warn("[WARN] Could not join multicast group (sender only?)");
  }
  console.log("[BRIDGE] Socket Ready. Igniting Stream...");
  startStream();
});

function startStream() {
  const ffmpegArgs = [];

  // Use '-re' (realtime) if reading from file to simulate proper timing
  if (CONFIG.file) {
    ffmpegArgs.push("-re");
    ffmpegArgs.push("-i", CONFIG.file);
  } else {
    ffmpegArgs.push("-i", "pipe:0");
  }

  ffmpegArgs.push(
    "-f",
    "s16le", // Output: Signed 16-bit Little Endian
    "-ac",
    "2", // Stereo
    "-ar",
    "44100", // 44.1kHz
    "-acodec",
    "pcm_s16le",
    "pipe:1", // Write to Stdout
  );

  const ffmpeg = spawn("ffmpeg", ffmpegArgs);

  if (CONFIG.file && !fs.existsSync(CONFIG.file)) {
    console.error(`[ERROR] File not found: ${CONFIG.file}`);
    process.exit(1);
  }

  ffmpeg.stderr.on("data", (data) => {
    if (CONFIG.verbose) console.error(`[FFMPEG] ${data.toString()}`);
  });

  ffmpeg.on("close", (code) => {
    console.log(`\n[BRIDGE] Stream Ended (Exit Code: ${code})`);
    process.exit(code);
  });

  ffmpeg.on("error", (err) => {
    console.error(`\n[BRIDGE] FFmpeg Error: ${err.message}`);
    console.error("Ensure 'ffmpeg' is installed and in your PATH.");
    process.exit(1);
  });

  // Chunking Logic
  let buffer = Buffer.alloc(0);

  ffmpeg.stdout.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= CHUNK_SIZE) {
      // Extract Payload
      const payload = buffer.subarray(0, CHUNK_SIZE);
      buffer = buffer.subarray(CHUNK_SIZE);

      // Construct Packet
      const packet = Buffer.concat([HEADER, payload]);

      // Blast
      server.send(packet, CONFIG.port, CONFIG.ip, (err) => {
        if (err) console.error("[TX ERROR]", err);
      });

      sequence++;
      bytesSent += packet.length;

      // Update status line occasionally
      if (sequence % 100 === 0) {
        process.stdout.write(
          `\r[BRIDGE] Packets: ${sequence} | Bytes: ${bytesSent} | Status: ON AIR  `,
        );
      }
    }
  });

  // Pipe Stdin if needed
  if (!CONFIG.file) {
    process.stdin.pipe(ffmpeg.stdin);
    process.stdin.on("end", () => {
      // Don't log here, let ffmpeg close handle it
    });
  }
}
