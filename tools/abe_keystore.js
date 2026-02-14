const { execSync } = require("child_process");

// THE KEYSTORE (The Handshake)
// Wraps macOS 'security' command to request keys via TouchID/Biometric.

function getKey(serviceName, accountName) {
  try {
    // -w: dump password only
    // -s: service name
    // -a: account name
    console.log(
      `[ABË] Requesting Access to ${serviceName}::${accountName}... (Please Touch ID)`,
    );
    const result = execSync(
      `security find-generic-password -w -s "${serviceName}" -a "${accountName}"`,
      {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"], // suppress error output if not found
      },
    ).trim();
    return result;
  } catch (e) {
    return null;
  }
}

// Try to find the keys in order of preference
const keyMap = {
  openai: { service: "OpenAI_API_KEY", account: "abeone" },
  anthropic: { service: "Anthropic_API_KEY", account: "abeone" },
  gemini: { service: "Gemini_API_KEY", account: "abeone" },
  elevenlabs: { service: "ElevenLabs_API_KEY", account: "abeone" },
};

// If running standalone, test the handshake
if (require.main === module) {
  const openai = getKey(keyMap.openai.service, keyMap.openai.account);
  if (openai) {
    console.log("ZING > Optical Nerve Powered by OpenAI.");
  } else {
    console.log("ZING > No Keys Found in Keychain. Please add them using:");
    console.log(
      `security add-generic-password -s "${keyMap.openai.service}" -a "${keyMap.openai.account}" -w "YOUR_KEY_HERE"`,
    );
  }
}

module.exports = { getKey, keyMap };
