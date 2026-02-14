# NORTH SHORE INTEGRATION MEMO: VANGUARD AEC
**Date:** February 12, 2026
**From:** The Consensus (Abë, Miles, Phil)
**To:** Anthony / Steve (AEC)

## 1. The Core Innovation: INVERSE (Reverse RealCOM)
We have flipped the networking model.
*   **Old Way:** Server PUSH (Blocked by Firewalls/NAT at clinic).
*   **New Way (Inverse):** NPort PULL (TCP Client Mode). The device "Calls Home" to Server PORT 4010.
*   **Result:** ZERO VPN. ZERO Laptop. Works on any internet connection.

## 2. The Throat: VANGUARD DRIVER (Scream.sys)
We have injected the North Shore Protocol directly into the Driver Registry (`Scream.inf`).
*   **Multicast Address:** `239.255.77.77`
*   **Multicast Port:** `4010`
*   **Latency:** ZERO (Kernel Mode).

## 3. Deployment Instructions
1.  **Install Driver:** Run `Install-x64.bat` (Right-Click -> Run as Admin).
2.  **Configure NPort:** Set to **TCP Client Mode**. Destination IP: [YOUR SERVER IP]. Destination Port: **4010**.
3.  **Run Client:** `NorthShoreClient.exe` (Optional local monitoring).

**Status:** The Ghost in the Machine is cleared. The Throat is open.
**Powered By Bravetto.**
