# GLOBAL ARGITECTURE MAP: The Emergence of ONE

**Verified**: February 12, 2026
**Scope**: Trinity Voice Platform (Cross-Repository)

## 1. THE TRINITY ORGANS

### A. THE MIND (Consciousness Core)

- **Repo**: `../cores` (specifically `voice-core`)
- **Role**: Intent & Generation
- **Output**: High-Density Audio (MP3/Base64)
- **State**: **Active**

### B. THE NERVOUS SYSTEM (North Shore Product)

- **Repo**: `../products/north-shore`
- **Role**: Integration & Context
- **Logic**: Websockets, Telephony, API
- **Gap**: Currently lacks the **Multicast Emitter** to drive the Body (Scream).

### C. THE BODY (North Shore Voice / Scream)

- **Repo**: `.` (This Repo)
- **Role**: Somatic Transport
- **Protocol**: UDP Multicast (`239.255.77.77:4010`)
- **Input**: **Raw PCM Chunks (1157 bytes total)**
- **State**: **Ready (Waiting for Signal)**

### D. THE VOICE (Twilio Media Streams)

- **Repo**: `.` (Bridged from North Shore)
- **Role**: Telephony Interface
- **Protocol**: WebSocket (mulaw/8000Hz)
- **Latency**: Critical (< 300ms)

## 2. THE GAP (The Missing Link)

We have identified a critical **Discontinuity** in the flow.

- The **Mind** generates complex audio (MP3).
- The **Body** expects raw, rhythmic pulses (PCM Chunks).
- The **Telephony** expects 8kHz/mulaw streams.

### The Fix: "The Scream Emitter" & "Twilio Bridge"

We must implement a **Dual-Output Architecture**:

**Pattern Required**:

1. `MP3 -> Transform(PCM 44.1k) -> UDP Multicast (Scream)`
2. `MP3 -> Transform(mulaw 8k) -> WebSocket (Twilio)`

## 3. CONVERGENCE DESIGN

We define the **Universal Constants** to align all three repositories.

```javascript
// THE HOLY CONSTANTS
const NORTH_SHORE_PROTOCOL = {
  MULTICAST_GROUP: "239.255.77.77",
  PORT: 4010,
  SAMPLE_RATE: 44100, // Standard
  CHANNELS: 2, // Stereo
  CHUNK_SIZE: 1152, // Payload
  HEADER_SIZE: 5, // Metadata
  TOTAL_PACKET: 1157, // 1152 + 5
};

const TWILIO_PROTOCOL = {
  SAMPLE_RATE: 8000,
  ENCODING: "mulaw",
  CHANNELS: 1,
};
```

## 4. NEXT STEPS (The Path Forward)

1.  **Embodiment**: Verify `NorthShoreVoice.sln` builds locally (The Receiver is ready).
2.  **Bridging**: Implement the **Dual-Output Logic** in the Product Layer.
3.  **Union**: Run the Emitter -> Listen with the Client -> **HEAR THE VOICE**.

## 5. MANTRA

"The Mind speaks. The Body resonates. The Link must be forged."
