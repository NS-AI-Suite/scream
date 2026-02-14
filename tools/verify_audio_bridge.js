const WebSocket = require("ws");
const http = require("http");

// Oracle 3: Audio Bridge Verification via Chrome DevTools Protocol
// "The Eye that Hears"

const CDP_PORT = 9222;
const EXPECTED_TITLE_KEYWORD = "Google"; // Or "Controlled" if we look for our marker

function log(msg) {
  console.log(`[Oracle 3] ${msg}`);
}

function fail(msg) {
  console.error(`❌ [Oracle 3] FAIL: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ [Oracle 3] PASS: ${msg}`);
  process.exit(0);
}

// 1. Discover Pages
const req = http.get(`http://localhost:${CDP_PORT}/json`, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    try {
      const targets = JSON.parse(data);
      const page = targets.find((t) => t.type === "page");

      if (!page) {
        log("No open tabs found. Creating a new one...");
        // Create new tab via CDP
        const options = {
          hostname: "localhost",
          port: CDP_PORT,
          path: "/json/new?https://google.com",
          method: "PUT",
        };

        const createReq = http.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const newTarget = JSON.parse(data);
              log(`Created tab: ${newTarget.title} (${newTarget.id})`);
              connectToPage(newTarget.webSocketDebuggerUrl);
            } catch (e) {
              fail(`Failed to create new tab: ${e.message}`);
            }
          });
        });
        createReq.on("error", (e) =>
          fail(`Could not create tab: ${e.message}`),
        );
        createReq.end();
        return;
      }

      log(`Connecting to ${page.url} (${page.title})...`);
      connectToPage(page.webSocketDebuggerUrl);
    } catch (e) {
      fail(`Failed to parse CDP JSON: ${e.message}`);
    }
  });
});

req.on("error", (e) => {
  fail(
    `Could not reach Chrome on port ${CDP_PORT}. Is it running? (${e.message})`,
  );
});

function connectToPage(wsUrl) {
  const ws = new WebSocket(wsUrl);

  ws.on("open", () => {
    // 2. Evaluate Environment
    // Check 1: Can we run JS?
    // Check 2: Audio Context exists?
    const id = 1;
    const expression = `
            ({
                title: document.title,
                hasAudioContext: typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined',
                userAgent: navigator.userAgent
            })
        `;

    ws.send(
      JSON.stringify({
        id: id,
        method: "Runtime.evaluate",
        params: {
          expression: expression,
          returnByValue: true,
        },
      }),
    );
  });

  ws.on("message", (message) => {
    const response = JSON.parse(message);

    if (response.id === 1) {
      if (response.error) {
        fail(`Runtime evaluation error: ${JSON.stringify(response.error)}`);
      }

      const result = response.result.result.value;
      log(`Inspected Page: "${result.title}"`);
      log(`User Agent: ${result.userAgent.substring(0, 50)}...`);

      if (result.hasAudioContext) {
        pass("AudioContext capability confirmed in Browser.");
      } else {
        fail("Browser does not support AudioContext.");
      }

      ws.close();
    }
  });

  ws.on("error", (e) => {
    fail(`WebSocket error: ${e.message}`);
  });
}
