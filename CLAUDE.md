# Scream Core: Vanguard Audio Transport

**Identity**: Somatic Layer / Audio Transport
**Role**: The "Throat" — Low-latency PCM multicast bridge (UDP → Localhost → Human Ears).
**Directive**: "Connect. Don't Build." Zero latency. Zero friction. Pure signal pipe.

# ─── EXECUTION SPINE ─────────────────────────────────────────────────

./EXECUTE [verify] # The only canonical interface. # Runs Driver check, Bridge check, and Oracle 3 (Chrome MCP). # Verdict: PASS / FAIL.

# ─── ARCHITECTURE ───────────────────────────────────────────────────

1. **Driver** (`src/Driver/`)
   - Windows Kernel Mode (WDM).
   - The absolute source of truth for the OS audio stack.

2. **Client** (`src/Client/`)
   - C# WinForms Receiver (`NorthShoreClient.exe`).
   - The verified receiver for Windows Endpoints.

3. **Bridge** (`tools/bridge.js`)
   - Node.js UDP Multicast Listener.
   - Websocket Server (Port 3000) for Browser/Substrate consumption.
   - The Somatic Link for non-Windows environments (macOS/Linux).

4. **Oracle 3** (`tools/verify_audio_bridge.js`)
   - Chrome DevTools Protocol (Port 9222).
   - Verifies the "Eye that Hears" (AudioContext in Chrome).

# ─── SOMATIC PROTOCOL ───────────────────────────────────────────────

**Multicast Group**: `239.255.77.77`
**Port**: `4010`
**Format**: PCM, 44.1kHz, 16-bit, Stereo, Little-Endian
**Packet**: 1157 bytes (5 header + 1152 payload)

# ─── COMMANDS ───────────────────────────────────────────────────────

# Diagnostics

nc -u -z -v 239.255.77.77 4010 # Check multicast liveness
node tools/listener.js # Run standalone receiver

# Development

node tools/bridge.js # Start the bridge manually
