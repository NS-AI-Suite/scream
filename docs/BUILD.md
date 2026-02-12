# BUILD INSTRUCTIONS: Forging the Body

**System Requirements**:

- **Windows 10/11 Machine** (Physical or VM)
- **Visual Studio 2022** (Community or Pro)
- **Windows Driver Kit (WDK)** - Matching your Windows SDK version.

## 1. BUILDING THE DRIVER (Kernel Mode)

**Path**: `src/Driver/Scream.vcxproj`

1.  Open `NorthShoreVoice.sln` in Visual Studio.
2.  Right-click `Scream` (Driver Project) -> **Properties**.
3.  Ensure **Platform Toolset** matches your WDK version (e.g., `WindowsKernelModeDriver10.0`).
4.  Select Configuration: **Release** / **x64**.
5.  **Build**.
6.  **Output**: `x64/Release/Scream.sys`, `Scream.inf`, `Scream.cat`.

> **Note**: This will produce a "Test Signed" driver by default. To sign for production, see `docs/DRIVER_SIGNING.md`.

## 2. BUILDING THE CLIENT (User Mode)

**Path**: `src/Client/ScreamReader/ScreamReader.csproj`

1.  Open `NorthShoreVoice.sln`.
2.  Right-click `ScreamReader` (Client Project).
3.  Select Configuration: **Release** / **Any CPU**.
4.  **Build**.
5.  **Output**: `src/Client/ScreamReader/bin/Release/NorthShoreClient.exe`.

## 3. BUILDING THE BRIDGES (Node.js)

**Path**: `tools/`

1.  Install Node.js 18+.
2.  `npm install` (if package.json exists, otherwise use standard libs).
3.  Verify: `node tools/bridge.js` (Requires ffmpeg).

## 4. PACKAGING

1.  Create a folder `Release/`.
2.  Copy `Scream.sys`, `Scream.inf`, `Scream.cat` to `Release/Driver/`.
3.  Copy `NorthShoreClient.exe` to `Release/Client/`.
4.  Zip it.
