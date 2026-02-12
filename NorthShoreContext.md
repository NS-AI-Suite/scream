# NORTH SHORE VOICE: The Connection Architecture

## 1. THE CONTEXT STRATEGY

**"Connect. Don't Build."**

You are moving from a "Multi-Repo Creator" mode to a "Single-Repo Deep Focus" mode. This feels restrictive, but it is actually **Convergent**.

- **The Fear**: "I don't have access to what has been built elsewhere."
- **The Reality**: This repository is **The Transceiver**. It does not need to _know_ the other parts; it only needs to _transmit_ to them.

**Proposal for Context**:
If you references external logic (e.g., "The Quantum Engine in Repo X"), simply paste the _interface_ or _contract_ into a `docs/external_context.md` file here. I will read that to align this repo with the outside world.

## 2. WHAT STAYS (The Signal)

To fulfill the specific mission of **North Shore Voice** (High-Fidelity Audio Link), we keep only what is necessary to **Send** and **Receive** the Signal.

| Component            | Status   | Why?                                                                                                                                                     |
| :------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scream/ (Driver)** | **CORE** | This is the **Transmitter**. It captures the "Voice" (System Audio) at the source (Kernel Level) and broadasts it. We do not rebuild this; we _tune_ it. |
| **ScreamReader/**    | **CORE** | This is the **Receiver**. It catches the signal. We will rebrand this to **North Shore Client**.                                                         |
| **Install/**         | **KEEP** | Essential for deploying the Transmitter (Driver) to Windows.                                                                                             |
| **doc/**             | **KEEP** | Reference for how the signal is packetized (Multicast/Unicast).                                                                                          |

## 3. WHAT GOES (The Noise)

These are not "bad" code, but they are "competing signals" that dilute the focus on a Windows-based North Shore Voice link.

| Component              | Status    | Why Remove?                                                                                                                       |
| :--------------------- | :-------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Receivers/unix/**    | **PURGE** | We are not building a Linux receiver today. If we need one later, we fetch the specific file. Right now, it's 20+ files of noise. |
| **Receivers/android/** | **PURGE** | Empty or non-functional. Distraction.                                                                                             |
| **tools/wireshark/**   | **PURGE** | Debugging artifact. Not part of the product.                                                                                      |
| **Scream Package/**    | **PURGE** | Redundant VS project structure.                                                                                                   |

## 4. EXECUTION PLAN

1.  **Purge**: We delete the "Noise" folders immediately.
2.  **Consolidate**: We move `ScreamReader` up to `src/Client` and `Scream` (Driver) to `src/Driver`.
3.  **Rename**: We rename the Solution to `NorthShoreVoice.sln`.

**Action Item**:
Shall I execute the **Purge** now? This will physically remove the noise and reveal the clear North Shore structure.
