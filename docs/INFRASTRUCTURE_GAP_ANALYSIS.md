# NORTH SHORE VOICE: Critical Infrastructure Analysis

**Status**: PRAGMATIC REVIEW
**Date**: February 12, 2026

## 1. THE GAP (Format & Physics)

The **Voice Core** speaks `MP3`. The **North Shore Body** hears `Raw PCM`.

- **Gap**: Missing **Transcoder/Emitter Bridge**.
- **Impact**: The Body is deaf to the Mind.
- **Solution**: A lightweight service (Node.js or Rust) that sits between the Product Backend and the Network. It must:
  1.  Receive MP3 Stream.
  2.  Decode to PCM (ffmpeg/lame).
  3.  Packetize to 1157-byte chunks.
  4.  Blast to 239.255.77.77.

## 2. THE TOPOLOGY (Network Reality)

The **North Shore Backend** likely runs in a Container (Docker/Cloud). The **Client** runs on Physical Windows.

- **Gap**: **Multicast Routing**.
  - If Backend is Cloud (Vercel): Multicast **cannot** reach your local machine.
  - If Backend is Docker (Local): Docker requires `--net=host` to multicast correctly.
- **Ideal Route**:
  - **Local Convergence**: Run the "Emitter Bridge" locally on the physical machine (or a local Pi), subscribed to the Cloud Backend via WebSocket, then multicasting onto the LAN.
  - **Cloud Tunnel**: Use a VPN (Tailscale) that supports multicast (hard) or tunnel the raw UDP.

## 3. THE IDEAL FLOW (The Path of Lease Resistance)

**A. The "Local Nexus" Pattern (Recommended)**
Don't try to multicast from the Cloud. It fails physics.

1.  **Cloud**: Generates MP3.
2.  **Local Bridge**: A small script running on your PC/Mac.
    - Connects to Cloud via WebSocket.
    - Receives Audio.
    - local-multicasts to `239.255.77.77`.
3.  **Scream**: Picks it up on the LAN.

**B. The "Direct Connect" Pattern**

1.  **Transport**: Abandon Multicast for Cloud-to-Client.
2.  **Protocol**: Use **WebRTC** or **TCP/WebSocket** directly to the Client.
3.  **Scream Role**: Scream (Kernel Driver) becomes strictly for _inter-app_ audio on the Windows machine, not network transport.

## 4. PRAGMATIC ACTION PLAN

1.  **Build the Local Bridge**: Create a `tools/bridge.js` in this repo.
    - Input: Standard Input (pipe MP3 file).
    - Output: Multicast UDP.
2.  **Verify Physics**:
    - Run `bridge.js` on your Mac.
    - Run `NorthShoreClient` on your PC.
    - _Hear the Sound_.
3.  **Productionize**:
    - Integrate `bridge.js` into the `north-shore` product as a "Local Agent".

## 5. DECISION

**We proceed with the Local Bridge.** It respects the physics of networking and the requirements of the Scream driver.
