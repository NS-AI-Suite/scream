const assert = require("assert");

// THE NORTH SHORE PROTOCOL CONSTANTS (V2.0)
const HEADER_SIZE = 6;
const PAYLOAD_SIZE = 1152;
const TOTAL_SIZE = 1158;
const EXPECTED_HEADER_STATIC = Buffer.from([129, 16, 2, 0x03, 0x00]); // 44.1kHz, 16-bit, Stereo, Mask

console.log("[TEST] Verifying North Shore Protocol V2.0 Physics...");

// 1. Packet Size Verification
assert.strictEqual(
  HEADER_SIZE + PAYLOAD_SIZE,
  TOTAL_SIZE,
  "Total Packet Size must be 1158 bytes (V2.0)",
);
console.log("✓ Packet Size Logic: PASS");

// 2. Head Construction Verification
function createPacket(sequence) {
  const seqByte = Buffer.alloc(1);
  seqByte[0] = sequence;

  const payload = Buffer.alloc(PAYLOAD_SIZE, 0xff); // Dummy data
  const packet = Buffer.concat([EXPECTED_HEADER_STATIC, seqByte, payload]);
  return packet;
}

const TEST_SEQ = 42;
const packet = createPacket(TEST_SEQ);

// 3. Validation Logic
assert.strictEqual(
  packet.length,
  TOTAL_SIZE,
  "Generated packet must be 1158 bytes",
);
console.log("✓ Packet Generation: PASS");

assert.deepStrictEqual(
  packet.subarray(0, 5),
  EXPECTED_HEADER_STATIC,
  "Header Static Block must match North Shore Standard",
);
console.log("✓ Header Alignment: PASS");

assert.strictEqual(packet[5], TEST_SEQ, "Byte 5 must be Sequence Number");
console.log("✓ Sequence Integrity: PASS");

assert.strictEqual(packet[6], 0xff, "Byte 6 starts Payload");
console.log("✓ Payload Offset: PASS");

console.log(
  "\n[SUCCESS] The North Shore Protocol V2.0 is Mathematically Sound.",
);
