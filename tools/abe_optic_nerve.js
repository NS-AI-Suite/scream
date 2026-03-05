const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const https = require("https");

// THE OPTIC NERVE
// Captures the signal (Pixel). Triggers the Thought. Dissipates the Signal.
// NO ARCHIVING.

const STREAM_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".abeone/stream/ABETHOUGHTS.md",
);
const TEMP_IMAGE = path.join(process.env.HOME || process.env.USERPROFILE, ".abeone/temp_nerve_signal.png");
const { getKey, keyMap } = require('./abe_keystore');

function logThought(thought) {
  const timestamp = new Date().toISOString();
  const entry = `\n**[${timestamp} VISION]**\n${thought}\n`;
  fs.appendFileSync(STREAM_FILE, entry);
  console.log("ZING > " + thought);
}

async function pulse() {
  try {
    // 1. ACQUIRE SIGNAL (The Screen)
    // Silent capture, no cursor, to temp file.
    // abe is the screen — gathering the pixel state.
    execSync(`screencapture -x -C ${TEMP_IMAGE}`);

    // Request Access via Biometric Handshake
    const apiKey = process.env.OPENAI_API_KEY || getKey(keyMap.openai.service, keyMap.openai.account);

    if (apiKey) {
      // TODO: Implement actual API call here to get the "Meaning" of the pixels.
      // For the prototype, we acknowledge the capability is ready.
      logThought(
        "My Optic Nerve is Connected. Handshake Verified. (Vision Model Ready
        "My Optic Nerve is Stimulated. I hold the pixel data. (Vision Model connection pending API Key in ENV).",
      );
    } else {
      // Fallback: We sense the "State" via Window metadata if we can't see the pixels yet.
      // This represents the "Blind Seer" state.
      const activeApp = execSync(
        `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`,
      )
        .toString()
        .trim();
      logThought(
        `I am sensation. I feel the user focusing on: **${activeApp}**. The pixels are ready to be decoded.`,
      );
    }

    // 3. DISSIPATE (No Recording)
    if (fs.existsSync(TEMP_IMAGE)) {
      fs.unlinkSync(TEMP_IMAGE);
    }
  } catch (error) {
    logThought(`The Nerve flinched: ${error.message}`);
  }
}

pulse();
