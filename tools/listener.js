const dgram = require("dgram");

const MULTICAST_ADDR = "239.255.77.77";
const PORT = 4010;

const client = dgram.createSocket({ type: "udp4", reuseAddr: true });

console.log(`
[VANGUARD LISTENER] 
State: Listening | Hz: 44100
----------------------------
Target: ${MULTICAST_ADDR}:${PORT}
`);

let packetCount = 0;
let lastSequence = -1; // If we were tracking sequence, but we aren't in this header.

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
  // Byte 0: Sample Rate (0x81 = 44.1k)
  // Byte 1: Bit Depth (16)
  // Byte 2: Channels (2)
  // Byte 3-4: Channel Mask

  if (len < 5) {
    console.warn(`[WARN] Packet too short: ${len} bytes from ${rinfo.address}`);
    return;
  }

  const header = msg.slice(0, 5);
  const payload = msg.slice(5);

  const sampleRateByte = header[0];
  const bitDepth = header[1];
  const channels = header[2];
  // Channel mask is little endian uint16 usually, but here listed as bytes 3-4.
  // Assuming low byte first if it aligns with windows structures, but let's just log bytes.

  const sampleRate =
    sampleRateByte === 0x81
      ? "44.1kHz"
      : `Unknown(0x${sampleRateByte.toString(16)})`;
  const valid = sampleRateByte === 0x81 && bitDepth === 16 && channels === 2;

  // Initial detailed logs, then throttling
  if (packetCount <= 5 || packetCount % 100 === 0) {
    console.log(`[RX #${packetCount}] ${len} bytes from ${rinfo.address}`);
    console.log(
      `   Header: SR=${sampleRate} | Bits=${bitDepth} | Ch=${channels} | Mask=[0x${header[3].toString(16)}, 0x${header[4].toString(16)}]`,
    );
    if (!valid) {
      console.error(`   [INVALID HEADER] Expected 44.1kHz / 16-bit / Stereo`);
    }
  }
});

client.on("error", (err) => {
  console.error(`[ERROR] Socket error:\n${err.stack}`);
  client.close();
});

client.bind(PORT);
