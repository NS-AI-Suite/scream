using System;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace ScreamReader
{
    /// <summary>
    /// The Gatekeeper enforces the North Shore Access Protocol.
    /// It ensures that only valid, licensed endpoints can open the audio stream.
    /// </summary>
    public static class Gatekeeper
    {
        private const string LICENSE_FILE = "north_shore.key";

        /// <summary>
        /// VERIFY: Checks if the current machine is authorized to receive the signal.
        /// </summary>
        /// <returns>True if access is granted; otherwise, false.</returns>
        public static bool IsAuthorized()
        {
            // 1. CHECK: Does a license key exist?
            // In the future, this might check a Registry Key or call an API (North Shore Cloud).
            // For now, we look for a simple presence of a key file or default to OPEN for dev.
            
            // TODO: Implement actual validation logic here (e.g. check signature, call API)
            // For the "Holyshit" realization moment, we are marking this spot.
            
            bool hasLicense = File.Exists(LICENSE_FILE);

            // 2. LOGIC: If we want to enforce it now, uncomment the return below.
            // return hasLicense; 

            // DEFAULT: Allow access for now, but LOG that we checked.
            Console.WriteLine("[Gatekeeper] Access Requested. Status: " + (hasLicense ? "SECURE" : "OPEN"));
            
            return true; 
        }

        public static void DemandEntry()
        {
            if (!IsAuthorized())
            {
                MessageBox.Show(
                    "NORTH SHORE ACCESS DENIED.\n\nPlease verify your license at northshore.voice/activate",
                    "Gatekeeper",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                Environment.Exit(403); // Forbidden
            }
        }
    }
}
