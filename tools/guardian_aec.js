const dgram = require("dgram");

const MULTICAST_ADDR = "239.255.77.77";
const PORT = 4010;

const client = dgram.createSocket({ type: "udp4", reuseAddr: true });

console.log(`
[VANGUARD GUARDIAN: AEC]
State: Monitoring | Role: Echo Cancellation
-------------------------------------------
Target: ${MULTICAST_ADDR}:${PORT}
`);

let packetCount = 0;
let lastConvergeTime = Date.now();

client.on("listening", () => {
  const address = client.address();
  console.log(`[BIND] Listening on ${address.address}:${address.port}`);
  try {
    client.addMembership(MULTICAST_ADDR);
  } catch (e) {
    console.error(`[ERROR] Failed to add membership: ${e.message}`);
  }
});

client.on("message", (msg, rinfo) => {
  packetCount++;
  const now = Date.now();

  // Simulate AEC convergence logic
  if (now - lastConvergeTime > 2000) {
    console.log(`[AEC] Converging... Stream Stable. Packets: ${packetCount}`);
    lastConvergeTime = now;
  }
});

client.bind(PORT);
