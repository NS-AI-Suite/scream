# Aura: The Somatic Bridge

**Identity**: `aura`
**Type**: Hardware/Driver Layer (Vanguard)
**Role**: Low-latency PCM audio transport (Localhost → Human Ears)

## The Bridge Contract

Aura is the "throat" of the machine. It accepts raw audio streams from software ventures (like `abevoices`) and physically manifests them as sound.

### 1. Input Interface (The Vein)

Ventures push audio to Aura via UDP Multicast.

- **Protocol**: UDP Multicast
- **Address**: `239.255.77.77`
- **Port**: `4010`
- **Format**: PCM, 44.1kHz, 16-bit, Stereo, Little-Endian
- **Packet Size**: 1157 bytes (5 bytes header + 1152 bytes payload)

### 2. Transport Layer (The Nerve)

- **Driver**: `Scream.sys` (Kernel Mode, Windows)
- **Client**: `NorthShoreClient.exe` (User Mode Receiver)
- **Bridge**: `tools/bridge.js` (Unix/Mac/Docker Shim)
  - _Note_: In non-Windows environments (like this substrate), `bridge.js` acts as the receiver, converting UDP packets to a WebSocket stream for the browser.

### 3. Output Interface (The Voice)

Scream manifests audio through the host system.

- **Primary**: Windows Audio Endpoint (Kernel)
- **Secondary** (Substrate Mode): Chrome Audio Context
  - **WebSocket**: `ws://localhost:3000` (PCM Stream)
  - **Playback**: Chrome `AudioContext` (managed by `tools/bridge.js` client)

### 4. Health & Diagnostics (The Pulse)

How to verify Scream is alive:

- **Liveness**: `nc -z -u -v 239.255.77.77 4010` (Multicast Group Active)
- **Oracle 3 (Somatic)**: Chrome DevTools Protocol (@ 9222) verifies:
  - `AudioContext` is `running`
  - Receiver page is active (`http://localhost:3000` or equivalent)
- **Evidence**: Run `./EXECUTE` to generate a full health report.
