# NORTH SHORE VOICE: Critical Urgency & Gaps

**Status**: IMMEDIATE ATTENTION
**Scope**: Sustained Engineering & Future Proofing

## 1. THE HARDCODED FRAGILITY

**Issue**: The Multicast Address (`239.255.77.77`) and Port (`4010`) are hardcoded in `src/Driver/savedata.cpp`.
**Risk**: If the network environment changes (e.g., multicast collision), you cannot change the channel without **Recompiling the Kernel Driver**.
**Fix Required**:

- Update `CSaveData::CreateSocket` to read `HKLM\SYSTEM\CurrentControlSet\Services\Scream\Parameters` from the Registry.
- Look for `MulticastIP` and `MulticastPort` DWORD/String values.
- Fallback to constants if missing.

## 2. THE SIGNING BARRIER (The Great Filer)

**Issue**: Modern Windows (10/11) with Secure Boot **will not load** this driver (`Scream.sys`) unless it is signed by Microsoft (WHQL/Attestation Signing).
**Current State**: You likely have "Test Signing" enabled or Secure Boot disabled to run this.
**Future Proofing**:

- **Action**: You must obtain an **EV Code Signing Certificate**.
- **Process**: Submit the `.sys` to the Microsoft Hardware Developer Center for "Attestation Signing".
- **Documentation**: See `docs/DRIVER_SIGNING.md`.

## 3. PACKET LOSS PHYSICS

**Issue**: UDP Multicast does not guarantee delivery. Wi-Fi networks often drop multicast packets aggressively (to save airtime).
**Result**: "Crackling" or "Robotic" artifacts in the voice.
**Mitigation**:

- **Client Side**: Implement a Jitter Buffer in `NorthShoreClient`.
- **Network Side**: Recommend Wired Ethernet or dedicated 5GHz channel.

## 4. ARCHITECTURAL DELTA

| Feature       | Current State   | Target State                                  |
| :------------ | :-------------- | :-------------------------------------------- |
| **Config**    | Hardcoded C++   | Registry Dynamic                              |
| **Signing**   | Unsigned / Test | MS Attested                                   |
| **Transport** | Pure UDP        | Forward Error Correction (FEC)?               |
| **Client**    | Direct Play     | Jitter Buffer + PLC (Packet Loss Concealment) |
