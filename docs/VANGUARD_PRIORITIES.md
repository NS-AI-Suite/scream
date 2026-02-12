# VANGUARD PRIORITIES

**Status**: IMMEDIATE EXECUTION

1.  **[CRITICAL] Unbind the Driver (C++)**:
    - Modify `src/Driver/savedata.cpp` to implement `RtlQueryRegistryValues`.
    - Purpose: Remove hardcoded IP/Port.

2.  **[HIGH] Forge the Nexus (Node.js)**:
    - Upgrade `tools/bridge.js`.
    - Purpose: Enable robust simulation and "Local Nexus" capability with CLI args.

3.  **[MEDIUM] Verify Simulation**:
    - Run the upgraded Bridge against the Listener.
    - Purpose: Confirm Protocol Integrity.

4.  **[BLOCKED] Compile & Sign**:
    - Requires Windows Environment.
    - Action: Prepare the code for the Windows Forge.
