const WebSocket = require("ws");
const fs = require("fs");
const { spawn } = require("child_process");

// CONFIG
const PORT = 5050; // Twilio usually connects here (tunneled)

console.log(`[TWILIO-BRIDGE] Starting WebSocket Server on port ${PORT}`);
const wss = new WebSocket.Server({ port: PORT });

wss.on("connection", (ws) => {
  console.log("[TWILIO] Connection Received");
  let streamSid = null;

  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    if (msg.event === "start") {
      streamSid = msg.start.streamSid;
      console.log(`[TWILIO] Stream Started: ${streamSid}`);

      // MOCK: Start sending audio immediately upon connection
      startInjectingAudio(ws, streamSid);
    } else if (msg.event === "media") {
      // We received audio from the phone (User speaking)
      // TODO: Pipe this to STT Core
    } else if (msg.event === "stop") {
      console.log(`[TWILIO] Stream Stopped: ${streamSid}`);
    }
  });
});

function startInjectingAudio(ws, streamSid) {
  console.log("[AI] Generating Voice (Simulated)...");

  // 1. GENERATE (Simulate AI with ffmpeg test tone)
  // 2. TRANSCODE (Convert to 8k mulaw)
  // 3. SEND (Base64 to Twilio)

  const ffmpeg = spawn("ffmpeg", [
    "-re",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=440:duration=10", // Input: Tone
    "-f",
    "mulaw", // Output: mulaw
    "-ar",
    "8000", // Rate: 8k
    "-ac",
    "1", // Channels: 1
    "pipe:1", // To Stdout
  ]);

  ffmpeg.stdout.on("data", (chunk) => {
    if (ws.readyState === WebSocket.OPEN && streamSid) {
      const payload = chunk.toString("base64");
      const mediaMessage = {
        event: "media",
        streamSid: streamSid,
        media: {
          payload: payload,
        },
      };
      ws.send(JSON.stringify(mediaMessage));
    }
  });

  ffmpeg.on("close", () => {
    console.log("[AI] Generation Complete");
  });
}
