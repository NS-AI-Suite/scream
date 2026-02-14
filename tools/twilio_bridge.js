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

async function startInjectingAudio(ws, streamSid) {
  console.log("[AI] Acquiring Voice from Desk...");

  try {
    const text = "North Shore Online. I am listening.";
    const DESK_URL = process.env.DESK_URL || "http://host.docker.internal:3000"; // Docker->Host

    console.log(`[Bridge] Fetching speech from ${DESK_URL}/speak`);

    // NATIVE FETCH (Node 18+)
    const response = await fetch(`${DESK_URL}/speak`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });

    if (!response.ok)
      throw new Error(`Desk Error: ${response.status} ${response.statusText}`);

    // Transcode MP3 (from Desk) -> Mulaw 8k (for Twilio)
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      "pipe:0",
      "-f",
      "mulaw",
      "-ar",
      "8000",
      "-ac",
      "1",
      "pipe:1",
    ]);

    // Pipe WebStream to Node Stream
    const reader = response.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          ffmpeg.stdin.end();
          break;
        }
        ffmpeg.stdin.write(value);
      }
    };
    pump();

    ffmpeg.stdout.on("data", (chunk) => {
      if (ws.readyState === WebSocket.OPEN && streamSid) {
        ws.send(
          JSON.stringify({
            event: "media",
            streamSid: streamSid,
            media: { payload: chunk.toString("base64") },
          }),
        );
      }
    });

    ffmpeg.stderr.on("data", (d) => {}); // Silence ffmpeg logs
    ffmpeg.on("close", () => console.log("[AI] Speaking Complete"));
  } catch (e) {
    console.error("[Bridge] Failed to speak:", e.message);
    // Fallback? No. Silence is better than noise.
  }
}
