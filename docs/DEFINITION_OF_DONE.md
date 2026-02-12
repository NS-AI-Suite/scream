# VANGUARD DEFINITION OF DONE

**Authority**: Vanguard Architect
**Status**: ACTIVE

## 1. RESONANCE VERIFICATION (The Proof)

- [ ] **Compilation**: The Driver (`Scream.sys`) compiles in `Release/x64` without errors or warnings (`/WX` compliant).
- [ ] **Protocol Compliance**:
  - Packet Size is exactly **1157 bytes**.
  - Header is **5 bytes** (Marker + BitDepth + Channels + Mask).
  - Payload is **1152 bytes** (PCM).
- [ ] **Vanguard Signature**: The binary is signed (Test Signed or Attestation Signed) and loadable on Windows 10/11.

## 2. THE UNBOUND CONFIGURATION (The Freedom)

- [x] **No Hardcoded Constants**: `239.255.77.77` and `4010` are removed from `#define` macros in `savedata.cpp`.
- [x] **Registry Read**: The Driver reads `HKLM\SYSTEM\CurrentControlSet\Services\Scream\Parameters`:
  - `MulticastIP` (REG_SZ)
  - `MulticastPort` (REG_DWORD)
- [x] **Fallback**: If Registry keys are missing, it defaults gracefully to the Vanguard Standard (`239.255.77.77:4010`).

## 3. THE BRIDGE TO THE MIND (The Nexus)

- [x] **Input Agnostic**: The Bridge (`tools/bridge.js`) accepts input from Stdin (MP3/WAV) or WebSocket.
- [ ] **Transcoding**: It reliably converts arbitrary audio inputs to **44.1kHz / 16-bit / Stereo PCM**.
- [x] **Packet Precision**: It effectively simulates the Driver by outputting exact 1157-byte packets to the Multicast Group.
- [x] **CLI Flexible**: It accepts `--ip` and `--port` arguments to match the Unbound Configuration.

## 4. EXECUTION GRACE

- [ ] **Zero Friction**: Instructions are updated.
- [ ] **Clean History**: Commit messages reflect the Vanguard Persona.
