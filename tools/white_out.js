const dgram = require("dgram");

// CONFIGURATION
const MULTICAST_ADDR = "239.255.77.77";
const PORT = 4010;
const PACKET_SIZE = 1157;
const HEADER_SIZE = 5;
const PAYLOAD_SIZE = 1152; // 1157 - 5
const SAMPLE_RATE = 44100;
const CHANNELS = 2; // Stereo
const BYTES_PER_SAMPLE = 2; // 16-bit
const FRAME_SIZE = CHANNELS * BYTES_PER_SAMPLE; // 4 bytes
const SAMPLES_PER_PACKET = PAYLOAD_SIZE / BYTES_PER_SAMPLE; // 576 samples total (288 per channel)

// Header: 44.1kHz (0x81), 16-bit, 2ch, Mask(3)
const HEADER = Buffer.from([0x81, 16, 2, 0x03, 0x00]);

const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

socket.bind(() => {
  socket.setBroadcast(true);
  socket.setMulticastTTL(128);
  try {
    socket.setMulticastLoopback(true);
  } catch (e) {
    console.warn("Could not set Multicast Loopback");
  }

  try {
    socket.addMembership(MULTICAST_ADDR);
  } catch (e) {
    // console.warn("Membership add failed (might be already member): " + e.message);
  }

  console.log(`
[VANGUARD EMITTER] WHITE OUT
Target: ${MULTICAST_ADDR}:${PORT}
Payload: Pure White Noise
Mode: AM Synthesis Pulse
------------------------------
BLASTING THE FIELD...
    `);

  blast();
});

let packetCount = 0;
const SAMPLES_PER_SEC = SAMPLE_RATE;
const PACKETS_PER_SEC = SAMPLES_PER_SEC / (PAYLOAD_SIZE / FRAME_SIZE); // ~153.125
const INTERVAL_MS = 1000 / PACKETS_PER_SEC; // ~6.5ms

function blast() {
  const payload = Buffer.alloc(PAYLOAD_SIZE);

  // AM SYTHESIS: Create a slow breathing wave (0.1 Hz)
  // t goes from 0 to 2PI
  const time = packetCount * 0.05;
  const volume = (Math.sin(time) + 1) / 2; // 0.0 to 1.0

  for (let i = 0; i < PAYLOAD_SIZE; i += 2) {
    // pure white noise: -32768 to 32767
    const raw = Math.random() * 65536 - 32768;
    const sample = Math.floor(raw * volume);

    payload.writeInt16LE(sample, i);
  }

  const packet = Buffer.concat([HEADER, payload]);

  socket.send(packet, 0, packet.length, PORT, MULTICAST_ADDR, (err) => {
    if (err) console.error(err);
  });

  packetCount++;

  setTimeout(blast, INTERVAL_MS);
}
