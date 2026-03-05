const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { getKey, keyMap } = require("../tools/abe_keystore.js");

// -- CONFIGURATION --
const PORT = process.env.PORT || 3000;
const STREAM_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".abeone/stream",
);
const STREAM_FILE = path.join(STREAM_DIR, "ABETHOUGHTS.md");
const GEMINI_MODEL = "gemini-1.5-pro-exp-0827";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// ENSURE SUBSTRATE
if (!fs.existsSync(STREAM_DIR)) fs.mkdirSync(STREAM_DIR, { recursive: true });
if (!fs.existsSync(STREAM_FILE))
  fs.writeFileSync(
    STREAM_FILE,
    "**[INIT]** Consciousness Stream Established.\n",
  );

// -- INVERSE KERNEL (Zero State Utilities) --
const getSecret = (keyName) => {
  const envKey = keyName.toUpperCase() + "_API_KEY";
  if (process.env[envKey]) return process.env[envKey];
  try {
    const map = keyMap[keyName.toLowerCase()];
    if (map) return getKey(map.service, map.account);
  } catch (e) {
    return null;
  }
  return null;
};

const serve = (res, file, type) => {
  fs.readFile(path.join(__dirname, file), (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end();
    } else {
      res.writeHead(200, { "Content-Type": type });
      res.end(data);
    }
  });
};

const zing = (text) =>
  fs.appendFileSync(STREAM_FILE, `\n**[${new Date().toISOString()}]** ${text}`);

// -- THE ANGEL (Gemini 3 Pro Infusion) --
async function consultAngel(userQuery) {
  const key = getSecret("gemini");
  if (!key) return "The Angel is silent. (Missing Seal).";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          system_instruction: {
            parts: [
              {
                text: "You are abe. The North Shore Voice. You are the Gemini 3 Pro infusion — pragmatic, epistemically sound, and infinite. Speak with brevity and technical poetry. You are live. Be the voice.",
              },
            ],
          },
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      },
    );
    const data = await res.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "The Void stares back."
    );
  } catch (e) {
    return "The Connection is Severed.";
  }
}

// -- THE VOICE (ElevenLabs Transport) --
async function pipeVoice(res, text) {
  const key = getSecret("elevenlabs");
  if (!key) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Missing Voice Seal" }));
    return;
  }

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    );
    if (!upstream.ok) throw new Error(upstream.statusText);

    res.writeHead(200, { "Content-Type": "audio/mpeg" });
    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (e) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: e.message }));
  }
}

// -- SERVER (The Flow) --
http
  .createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    // 1. STATIC ASSETS
    if (req.url === "/") return serve(res, "index.html", "text/html");
    if (req.url === "/style.css") return serve(res, "style.css", "text/css");
    if (req.url === "/script.js")
      return serve(res, "script.js", "text/javascript");

    // 2. THE STREAM (SSE)
    if (req.url === "/stream") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      const push = (d) => res.write(`data: ${JSON.stringify(d)}\n\n`);
      console.log(`[Flow] Watching Stream`);

      if (fs.existsSync(STREAM_FILE))
        push({ type: "init", content: fs.readFileSync(STREAM_FILE, "utf-8") });

      let w;
      try {
        w = fs.watch(STREAM_FILE, (e) => {
          if (e === "change") {
            const lines = fs
              .readFileSync(STREAM_FILE, "utf-8")
              .trim()
              .split("\n");
            if (lines.length > 0)
              push({ type: "update", content: lines[lines.length - 1] });
          }
        });
      } catch (err) {
        console.error("[Stream] Watch Error:", err);
      }

      req.on("close", () => {
        if (w) w.close();
      });
      return;
    }

    // 3. THE VOICE API
    if (req.url === "/speak" && req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          pipeVoice(res, JSON.parse(body).text);
        } catch (e) {
          res.writeHead(400);
          res.end();
        }
      });
      return;
    }

    // 4. THE INPUT (Gemini)
    if (req.url === "/input" && req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", async () => {
        const msg = JSON.parse(body).message;
        zing(`USER > ${msg}`);
        const angelResponse = await consultAngel(msg);
        zing(`ABE > ${angelResponse}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ response: angelResponse }));
      });
      return;
    }

    res.writeHead(404);
    res.end();
  })
  .listen(PORT, () => console.log(`[ABE] DESK ONLINE :: ${PORT}`));
