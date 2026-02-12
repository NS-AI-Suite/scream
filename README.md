# NORTH SHORE VOICE: Vanguard Audio Transport

> **"Connect. Don't Build. Be One Signal."**

**North Shore Voice** is the **Vanguard** of the **Trinity Voice Platform**. It is a specialized Windows Kernel Driver and Receiver system designed to multicast high-fidelity PCM audio to the North Shore AI infrastructure with **Zero Latency** and **Zero Friction**.

---

## 🌊 SYSTEM ARCHITECTURE

```ascii
┌─────────────────────┐          UDP Multicast          ┌──────────────────────┐
│  src/Driver         │   (Dynamic Configuration)       │  src/Client          │
│  (Windows Kernel)   │ ─────────────────────────────►  │  (North Shore Client)│
└─────────────────────┘                                 └──────────┬───────────┘
                                                                   │
    "The Transmitter"                                        "The Receiver"
```

## 📁 REPOSITORY STRUCTURE

- **`src/Driver`**: The Kernel Mode Driver (formerly `Scream`). Captures system audio.
  - _Vanguard Status_: **Unbound**. Configurable via Registry (No longer hardcoded).
- **`src/Client`**: The User Mode Receiver (formerly `ScreamReader`). Plays or forwards audio.
- **`tools/`**: The **Local Nexus**. Bridges and diagnostics.
  - `bridge.js`: The Pulse Generator. Simulates the driver or bridges external audio.
- **`deploy/`**: Installation scripts (`.bat`) for the driver.
- **`docs/`**: Protocol specifications and integration context.

## 🚀 QUICK START

### 1. The Local Nexus (Simulation)

To simulate the heartbeat of the system without the driver:

```bash
# Stream an MP3 to the multicast group
node tools/bridge.js --file song.mp3 --ip 239.255.77.77 --port 4010
```

### 2. Install the Transmitter (Driver)

1.  Navigate to `deploy/`.
2.  Run `Install-x64.bat` as Administrator.
3.  Select **North Shore Voice** (Scream) as your Windows Output Device.

### 3. Run the Receiver (Client)

1.  Open `NorthShoreVoice.sln` in Visual Studio.
2.  Build `NorthShoreClient` (formerly ScreamReader).
3.  Run the executable. It will auto-connect to the multicast stream.

## 🔗 INTEGRATION CONTEXT

This repository is part of the **Trinity Voice Platform**.

- **Protocol**: 1157-byte UDP packets (Header + PCM). See [`docs/NORTH_SHORE_PROTOCOL.md`](docs/NORTH_SHORE_PROTOCOL.md).
- **Architecture**: See [`docs/NORTH_SHORE_INTEGRATION.md`](docs/NORTH_SHORE_INTEGRATION.md).

---

_Based on the open-source specificiation "Scream" by duncanthrax._
