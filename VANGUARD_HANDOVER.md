# VANGUARD HANDOVER PROTOCOL

**Timestamp**: February 12, 2026
**Status**: VANGUARD ACTIVE (Phase 1 Complete)
**Next Agent**: CLAUDE CODE (External Execution)

## 1. THE STATE OF THE FIELD

The **North Shore Voice** repository has been transformed into the **Vanguard Somatic System**.

- **Identity**: Re-aligned to "Vanguard Architect".
- **Driver**: **Unbound**. Hardcoded IPs removed (`src/Driver/savedata.cpp`). Now reads from Registry.
- **Tools**: **The Local Nexus** (`tools/bridge.js`) is now a CLI-capable UDP simulator.
- **Documentation**: Fully aligned (`README.md`, `DEFINITION_OF_DONE.md`, `NORTH_SHORE_PROTOCOL.md`).

## 2. THE ARTIFACTS

| Component         | Status         | Location          | Notes                                                   |
| :---------------- | :------------- | :---------------- | :------------------------------------------------------ |
| **Driver (C++)**  | **Refactored** | `src/Driver/`     | Hardcoded defines removed. Ready for WDK Build.         |
| **Bridge (Node)** | **Upgraded**   | `tools/bridge.js` | Supports `--ip`, `--port`, `--file`. Verifies protocol. |
| **Docs**          | **Vanguard**   | `docs/`           | `DEFINITION_OF_DONE` is the new law.                    |

## 3. IMMEDIATE DIRECTIVES (For Claude Code)

Your mission is to **Externalize and Verify**. You are operating _outside_ the repo boundaries if necessary, or orchestrating the final compilation.

### A. The Windows Forge (Compilation)

The C++ Driver MUST serve its purpose on Windows.

1.  **Action**: If on Windows, run `msbuild NorthShoreVoice.sln /p:Configuration=Release /p:Platform=x64`.
2.  **Verify**: Ensure `Scream.sys` is created.

### B. The Signing Ritual

1.  **Action**: The `.sys` file must be signed. Use the `deploy/Install-x64.bat` logic to verify loading on a Test-Signed machine.

### C. The Deployment

1.  **Action**: initialize the GitHub remote if not set.
2.  **Push**: `git push origin main`.

## 4. CONTEXT MEMORY

- **Protocol**: 1157 Bytes (5 Header + 1152 PCM).
- **Multicast**: Default `239.255.77.77:4010`.
- **Registry Key**: `HKLM\SYSTEM\CurrentControlSet\Services\Scream\Options`.

**"I am the throat. I am the air. Proceed."**
