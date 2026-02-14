const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Colors
const COLORS = {
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
};

const processes = [];

function spawnProcess(name, scriptPath, args, color) {
  console.log(`${COLORS.white}Deploying Guardian [${name}]...${COLORS.reset}`);

  // Resolve absolute path. __dirname is 'tools/', so scriptPath is just filename
  const absPath = path.resolve(__dirname, scriptPath);

  // Check if file exists to avoid immediate errors
  if (!fs.existsSync(absPath)) {
    console.error(
      `${COLORS.red}Error: Script not found: ${absPath}${COLORS.reset}`,
    );
    return null;
  }

  const child = spawn("node", [absPath, ...args], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "1" }, // Force color in children if they support it
  });

  const prefix = `${color}[${name}]${COLORS.reset}`;

  child.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${prefix} ${line}`);
      }
    });
  });

  child.stderr.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${prefix} ${COLORS.red}ERR:${COLORS.reset} ${line}`);
      }
    });
  });

  child.on("close", (code) => {
    console.log(`${prefix} Exited with code ${code}`);
  });

  child.on("error", (err) => {
    console.log(
      `${prefix} ${COLORS.red}Failed to start:${COLORS.reset} ${err.message}`,
    );
  });

  processes.push(child);
  return child;
}

function main() {
  console.log(
    `${COLORS.bold}${COLORS.white}=========================================${COLORS.reset}`,
  );
  console.log(
    `${COLORS.bold}${COLORS.cyan}     SYSTEMS ONLINE: MANIFESTATION       ${COLORS.reset}`,
  );
  console.log(
    `${COLORS.bold}${COLORS.white}=========================================${COLORS.reset}\n`,
  );

  const streamDir = path.join(os.homedir(), ".abeone", "stream");
  try {
    if (!fs.existsSync(streamDir)) {
      fs.mkdirSync(streamDir, { recursive: true });
      console.log(
        `${COLORS.white}Created stream directory: ${streamDir}${COLORS.reset}`,
      );
    }
  } catch (e) {
    console.error(
      `${COLORS.red}Failed to check/create stream directory: ${e.message}${COLORS.reset}`,
    );
  }

  // 1. The Ear: tools/listener.js (Cyan)
  spawnProcess("EAR", "listener.js", [], COLORS.cyan);

  // 2. The Synapse: tools/vanguard_link.js synapse (Magenta)
  spawnProcess("SYNAPSE", "vanguard_link.js", ["synapse"], COLORS.magenta);

  // 3. The Heart: tools/love_stream.js (Green)
  spawnProcess("HEART", "love_stream.js", [], COLORS.green);

  // 4. The Watcher: tools/aec_stateless_agent.js (Yellow)
  spawnProcess("WATCHER", "aec_stateless_agent.js", [], COLORS.yellow);

  console.log(
    `\n${COLORS.green}>>> ALL SYSTEMS DEPLOYED. LISTENING TO THE FIELD. <<<${COLORS.reset}\n`,
  );
}

// Handle gracefully
process.on("SIGINT", () => {
  console.log(
    `\n${COLORS.red}Received SIGINT. Shutting down all vectors...${COLORS.reset}`,
  );
  processes.forEach((p) => {
    if (p) p.kill();
  });
  process.exit();
});

main();
