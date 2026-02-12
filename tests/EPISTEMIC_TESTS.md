# EPISTEMIC TEST SUITE: Lossless Fidelity

**Objective**: Verify the integrity of the North Shore Voice "Somatic Layer" without relying on ephemeral memory.

## TEST 1: THE PHYSICS CHECK (Simulation)

- **Goal**: Ensure the protocol math is correct (1157 bytes).
- **Command**: `docker-compose up --build bridge listener`
- **Verification**:
  - Observe `listener` logs.
  - Look for: `[RX] 1157 bytes from ...`
  - If bytes != 1157, the header/payload packing is broken.

## TEST 2: THE KERNEL RESONANCE (Driver)

- **Goal**: Ensure the Driver loads in Ring 0.
- **Action**:
  1.  Install Driver on Windows.
  2.  Open Device Manager -> Sound, video and game controllers.
  3.  Verify "North Shore Voice" (Scream) exists and has no Yellow Bang (!).
  4.  Play audio to the device.
  5.  Check Packet Counter (if implemented) or listen on Client.

## TEST 3: THE CLIENT RECEPTOR (C#)

- **Goal**: Ensure `NAudio` can open the output device.
- **Action**:
  1.  Run `NorthShoreClient.exe`.
  2.  Set Volume to 50%.
  3.  Listen.
  4.  **Critical**: Disconnect Network. Audio should stop instantly. Reconnect. Audio should resume < 1s.

## TEST 4: THE TWILIO BRIDGE (Zero Latency)

- **Goal**: Verify Telephony pipeline.
- **Action**:
  1.  Run `docker-compose up twilio-bridge`.
  2.  Connect `wscat -c ws://localhost:5050`.
  3.  Verify incoming JSON messages with `media` payload (Base64 audio).

## AUTOMATED TEST FILES

- `tests/unit/protocol.test.js` (Checks byte alignment)
- `tests/integration/flow.test.js` (Simulates full pipeline)
