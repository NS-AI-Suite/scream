# NORTH SHORE VOICE: Engineering Convergence Plan

## 1. IDENTITY

**Current State**: Distracted repository containing `Scream` (Driver) and `ScreamReader` (Receiver) across multiple platforms.
**Target State**: **North Shore Voice** — A focused, high-fidelity audio transmission system.

## 2. COMPLETION REQUIREMENTS

To achieve North Shore Convergence, the following engineering tasks must be executed:

### A. Core Refactoring (The Signal)

- [ ] **Rename & Rebrand**: Transform `ScreamReader` into `North Shore Voice Client`.
- [ ] **Technical Debt (The Noise)**:
  - Fix `TODO` in `UdpWaveStreamPlayer.cs`: Implement proper channel mapping for NAudio.
  - Fix `TODO` in `mintopo.cpp`: Verify `WAVEIN_MUX` property node logic.
- [ ] **Driver Signing**: Ensure `Scream.sys` driver signing workflow is established (as per `README.md` warnings).

### B. Distraction Removal (The Release)

The following components are identified as "competing or distracting" and candidates for removal/archiving:

- `Receivers/unix/` (Unless hosting on Linux is required — **Confirm?**)
- `tools/wireshark/` (Debugging tool, not core product)
- `Scream Package/` (Redundant packaging project)
- `Receivers/android/` (Empty folder)
- `Receivers/dotnet-windows/ScreamReader/packages.config` (Migrate to PackageReference if possible for cleaner tree)

## 3. OPTIMAL PATH

1.  **Consolidate**: Move `ScreamReader` to root or `src/client`.
2.  **Purge**: Delete `Receivers/unix`, `Receivers/android`, `tools`.
3.  **Refactor**: Apply `North Shore` branding to UI strings and Project names.
4.  **Build**: Verify clean build of Driver + Client.

## MANTRA

"Focus the stream. Clear the channel. North Shore Voice is online."
