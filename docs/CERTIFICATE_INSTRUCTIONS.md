# NORTH SHORE VOICE: Certificate & Signing Guide

**Criticality**: BLOCKS PRODUCTION DEPLOYMENT
**Target**: Microsoft Hardware Developer Center (Partner Center)

## STEP 1: IDENTITY (The EV Certificate)

You cannot use a standard Code Signing Certificate. You need **Extended Validation (EV)**.

1.  **Provider**: DigiCert, Sectigo, or GlobalSign.
2.  **Cost**: ~$400 - $600 / year.
3.  **Validation**: Requires legal business entity verification (DUNS number, Articles of Incorporation).
4.  **Hardware**: The private key often arrives on a USB Hardware Token (YubiKey) to prevent theft.

## STEP 2: REGISTRATION (The Portal)

1.  Go to **Microsoft Partner Center**.
2.  Register as a **Hardware Developer**.
3.  Upload your EV Certificate (Public Key) to link your account.
4.  Sign the legal agreements.

## STEP 3: THE PACKAGE (HLK/HCK)

_For a simple software-only driver like Scream, "Attestation Signing" allows you to skip the full HLK test suite on Windows 10/11._

1.  Compile the Driver (`Scream.sys`, `Scream.inf`, `Scream.cat`).
2.  Create a strict **Cabinet (CAB) File**:
    ```powershell
    makecab /f Scream.ddf
    ```
3.  Sign the CAB file with your EV Certificate:
    ```powershell
    signtool sign /v /fd sha256 /s my /n "Your Company Name" /t http://timestamp.digicert.com disk1/Scream.cab
    ```

## STEP 4: SUBMISSION (Attestation)

1.  Log in to Partner Center -> **Hardware** -> **Submit New Hardware**.
2.  Upload the signed CAB.
3.  Select "Attestation Signing" (if available) or select requested OS targets.
4.  Wait for Microsoft to process (Automated, usually < 1 hour).

## STEP 5: THE PRIZE

1.  Download the **Signed ZIP** from Microsoft.
2.  It contains a new `Scream.cat` (Security Catalog) signed by Microsoft.
3.  **Result**: This driver now installs on any Windows machine with Secure Boot enabled, without warnings.

## FAILED STATE (Recovery)

If the signing fails or expires:

- **Immediate**: Revert users to "Test Mode" (requires 3 reboots + BIOS change).
- **Critical**: Do not let the certificate expire. Set calendar reminders 90 days out.
