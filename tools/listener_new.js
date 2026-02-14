const dgram = require("dgram");
const { spawn, execSync } = require("child_process");

const MULTICAST_ADDR = "239.255.77.77";
const PORT = 4010;

const client = dgram.createSocket({ type: "udp4", reuseAddr: true });

let playbackProcess = null;
let playbackTool = null;

// Determine available playback tool (ffplay or sox/play)
try {
  try {
    execSync("which ffplay");
    playbackTool = "ffplay";
  } catch (e) {
    execSync("which play");
    playbackTool = "sox";
  }
} catch (e) {
  // Neither found
}

if (playbackTool === "ffplay") {
  console.log("[Audio] Spawning ffplay...");
  // -nodisp: no window
  // -f s16le: signed 16-bit little endian
  // -ar 44100: 44.1kHz
  // -ac 2: stereo
  // -i pipe:0: read from stdin
  playbackProcess = spawn("ffplay", [
    "-nodisp",
    "-f",
    "s16le",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-i",
    "pipe:0",
  ]);

  // Handle ffplay stderr to avoid spam but catch errors
  playbackProcess.stderr.on("data", (data) => {
    // console.error(`[FFPlay]: ${data}`);
  });
} else if (playbackTool === "sox") {
  console.log("[Audio] Spawning sox (play)...");
  playbackProcess = spawn("play", [
    "-t",
    "raw",
    "-r",
    "44100",
    "-b",
    "16",
    "-c",
    "2",
    "-e",
    "signed-integer",
    "-",
  ]);

  playbackProcess.stderr.on("data", (data) => {
    // console.error(`[Sox]: ${data}`);
  });
} else {
  console.log(
    "[Audio] No playback tool found (ffplay/sox). Install ffmpeg to HEAR the signal.",
  );
}

console.log(`
[VANGUARD LISTENER] 
State: Listening | Hz: 44100
Playback: ${playbackTool ? playbackTool.toUpperCase() : "NONE (Logging Only)"}
----------------------------
Target: ${MULTICAST_ADDR}:${PORT}
`);

let packetCount = 0;

client.on("listening", () => {
  const address = client.address();
  console.log(`[BIND] Listening on ${address.address}:${address.port}`);

  try {
    client.addMembership(MULTICAST_ADDR);
    console.log(`[JOIN] Joined Multicast Group: ${MULTICAST_ADDR}`);
  } catch (e) {
    console.error(`[ERROR] Failed to add membership: ${e.message}`);
  }
});

client.on("message", (msg, rinfo) => {
  packetCount++;
  const len = msg.length;

  // Header Parsing (5 bytes)
  if (len < 5) {
    console.warn(`[WARN] Packet too short: ${len} bytes from ${rinfo.address}`);
    return;
  }

  // Strip 5-byte header
  const payload = msg.slice(5);

  // Pipe to playback process if active
  if (playbackProcess && playbackProcess.stdin.writable) {
    try {
      playbackProcess.stdin.write(payload);
    } catch (err) {
      console.error("[Audio] Write error:", err);
    }
  }

  // Log occasionally to confirm activity without spamming
  if (packetCount % 50 === 0) {
    console.log(
      `[RX] ${packetCount} packets | Last: ${len} bytes (Payload: ${payload.length}) from ${rinfo.address}`,
    );
  }
});

client.bind(PORT);
