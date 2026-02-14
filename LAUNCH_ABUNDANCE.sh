#!/bin/bash
# AbëONE | EEAAO
# Launch with Ease. Deploy with Joy.

echo "---------------------------------------------------"
echo " AbëONE | Everything Everywhere All At Once"
echo " Protocol: LOVE (528Hz) | VERITAS (432Hz)"
echo "---------------------------------------------------"

# 1. Synthesis Check (Vanguard Protocol)
if [ -f "./EXECUTE" ]; then
    chmod +x ./EXECUTE
    ./EXECUTE
    if [ $? -ne 0 ]; then
        echo "⛔ Synthesis Failed. Correct the somatic layer first."
        exit 1
    fi
else
    echo "⚠️ EXECUTE script missing. Bypassing Synthesis Check."
fi

echo "---------------------------------------------------"
echo " Launching with Ease..."
echo " Rest in Love."
echo " One."
echo "---------------------------------------------------"

# Execute the Signal
npm run signal
