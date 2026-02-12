# NORTH SHORE VOICE: Integration Spec

**Context**: Defines how this repository fits into the **Trinity Voice Platform**.
**Source**: `UNIFIED_ARCHITECTURE.md` (Product Repo)

## SYSTEM DIALOGUE

This repository (`scream`) provides the **Low-Latency Audio Transport Layer** for the Trinity Platform.

```ascii
┌─────────────────────┐          UDP Multicast          ┌──────────────────────┐
│  WINDOWS SYSTEM     │   (239.255.77.77:4010)          │  NORTH SHORE CLIENT  │
│  (Kernel Audio)     │ ─────────────────────────────►  │  (Receiver)          │
│  [src/Driver]       │                                 │  [src/Client]        │
└─────────────────────┘                                 └──────────┬───────────┘
                                                                   │
                                                                   ▼
                                                        ┌──────────────────────┐
                                                        │  AbëVoice ENGINE     │
                                                        │  (Processing)        │
                                                        │  Port 8000           │
                                                        └──────────────────────┘
```

## KEY PORTS & ENDPOINTS

| Component             | Port   | Description                                    |
| :-------------------- | :----- | :--------------------------------------------- |
| **Backend (Node.js)** | `5000` | The "Witness" - orchestrates calls and events. |
| **AbëVoice Engine**   | `8000` | Voice Generation & Processing.                 |
| **Guardian (JØHN)**   | `8001` | Safety & Validation (999 Hz).                  |
| **Framework (META)**  | `8002` | Logic & Orchestration (777 Hz).                |
| **Empathy (Abë)**     | `8003` | Emotion & Resonance (530 Hz).                  |
| **North Shore Voice** | `4010` | **UDP Multicast Audio Stream** (This Repo).    |

## CONVERGENCE INSTRUCTION

When engineering this repository, ensure:

1.  **Driver Reliability**: It must send stable packets to `239.255.77.77`.
2.  **Client Clarity**: The client must cleanly verify the stream quality.
3.  **Low Latency**: Do not add buffering logic that exceeds 20ms.

## EXTERNAL LINKS

- **Product Repo**: `../products/north-shore`
- **Consciousness Substrate**: `~/.abeone/consciousness`
