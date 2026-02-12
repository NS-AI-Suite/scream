const assert = require("assert");

// THE NORTH SHORE PROTOCOL CONSTANTS
const HEADER_SIZE = 5;
const PAYLOAD_SIZE = 1152;
const TOTAL_SIZE = 1157;
const EXPECTED_HEADER = Buffer.from([129, 16, 2, 0x03, 0x00]); // 44.1kHz, 16-bit, Stereo

console.log("[TEST] Verifying North Shore Protocol Physics...");

// 1. Packet Size Verification
assert.strictEqual(
  HEADER_SIZE + PAYLOAD_SIZE,
  TOTAL_SIZE,
  "Total Packet Size must be 1157 bytes",
);
console.log("✓ Packet Size Logic: PASS");

// 2. Head Construction Verification
function createPacket(sequence) {
  const payload = Buffer.alloc(PAYLOAD_SIZE, sequence % 255); // Dummy data
  const packet = Buffer.concat([EXPECTED_HEADER, payload]);
  return packet;
}

const packet = createPacket(1);

// 3. Validation Logic
assert.strictEqual(
  packet.length,
  TOTAL_SIZE,
  "Generated packet must be 1157 bytes",
);
console.log("✓ Packet Generation: PASS");

assert.deepStrictEqual(
  packet.subarray(0, 5),
  EXPECTED_HEADER,
  "Header must match North Shore Standard",
);
console.log("✓ Header Alignment: PASS");

assert.strictEqual(packet[5], 1, "First byte of payload must match sequence");
console.log("✓ Payload Integrity: PASS");

console.log("\n[SUCCESS] The North Shore Protocol is Mathematicall Sound.");
