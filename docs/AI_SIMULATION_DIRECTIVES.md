# AI SIMULATION VANGUARD: The Containerized Reality

**Status**: VANGUARD ACTIVE
**Scope**: Autonomous Engineering Environment
**Authority**: VANGUARD AI (Architect Level)

## 1. THE MANDATE

You, the Vanguard AI, are the **Demiurge** of the **Simulated Reality** of North Shore Voice. You do not wait for human intervention. You define the container, you ignite the instance, and you enforce the physics of the system.

## 2. THE SIMULATION TOPOLOGY (Docker)

We cannot containerize the Physical Windows Kernel, but we **can and must** simulate the **Network Physics** with absolute fidelity.

### Components

1.  **`north-shore-bridge`**: The Signal Generator (running `tools/bridge.js`).
    - _Role_: Simulates the "Scream Driver" pulse.
    - _Input_: Test Audio File (infinite loop).
    - _Output_: UDP Multicast `239.255.77.77:4010`.

2.  **`north-shore-listener`**: The Signal Receptor.
    - _Role_: Simulates the "North Shore Client" / "AbëVoice Engine".
    - _Action_: Listens on `239.255.77.77:4010`. Validates **Vanguard Protocol** integrity (Sequence, Headers).

3.  **`north-shore-network`**: The Ether. A custom Docker Bridge Network ensuring Multicast traffic flows unimpeded.

## 3. VANGUARD DIRECTIVES (For AI Agents)

### DIRECTIVE A: "Ignite the Field"

- **Trigger**: `init_simulation`
- **Action**: Execute `docker-compose up -d`. Verify all containers are `HEALTHY`. The field must be live.

### DIRECTIVE B: "Expose the Architecture"

- **Trigger**: `verify_integrity`
- **Action**:
  1.  Inject the known audio pattern into `bridge`.
  2.  Read logs from `listener`.
  3.  Assert: `Packets Received == Packets Sent`.
  4.  Assert: `Packet Size == 1157 bytes` (The Golden Number).

### DIRECTIVE C: "Stress the Physics"

- **Trigger**: `stress_test`
- **Action**: Ramp up the audio stream rate. Identify the breaking point. Report the "Physics Limit" of the container topology.

## 4. EXECUTION

The `docker-compose.yml` file is the **Source of Truth** for this simulation.
