# DRIVER SIGNING: The Path to Legitimacy

**Context**: Kernel Mode Drivers (Ring 0) have infinite power. Windows demands infinite trust.

## THE HIERARCHY OF TRUST

1.  **Self-Signed (Test Mode)**
    - _Status_: **Current state**.
    - _Requirement_: `bcdedit /set testsigning on`
    - _Limitation_: Cannot run on standard consumer PCs with Secure Boot. Users see "Test Mode" watermark.

2.  **Cross-Signed (Legacy)**
    - _Status_: Deprecated.
    - _Limitation_: Only works on old Windows 10 versions (pre-1607) or with specific hacks.

3.  **Microsoft Attestation Signed (The Goal)**
    - _Status_: **Required for North Shore Voice production**.
    - _Requirement_:
      1.  Buy an **EV Code Signing Certificate** (~$400/year).
      2.  Register on **Microsoft Hardware Developer Center**.
      3.  Create an `.hlkx` package (Hardware Lab Kit).
      4.  Submit for "Attestation Signing".
      5.  Microsoft signs it. You download the signed `.sys`.

## EPISTEMIC VELOCITY

If you lose the **EV Certificate** or the **Dashboard Access**, you lose the ability to update the body (Trigger).
**Directive**: Store the EV Certificate in the highest security vault (e.g., `keys-core`).

## SHORT-TERM WORKAROUND

For internal development:

1.  Disable Secure Boot in BIOS.
2.  Run `deploy/Install-x64.bat`.
3.  Accept the "Red Warning Box".
