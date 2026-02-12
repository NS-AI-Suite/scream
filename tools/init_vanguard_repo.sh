#!/bin/bash
# VANGUARD REPO INITIALIZER
# Connects the Somatic Body to the GitHub Mind

echo "==========================================="
echo "   NORTH SHORE VOICE: VANGUARD INITIALIZER "
echo "==========================================="

# 1. Check for Git
if ! command -v git &> /dev/null; then
    echo "[ERROR] Git is not installed."
    exit 1
fi

# 2. Confirm Current State
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null)
echo "[INFO] Current Remote: $CURRENT_REMOTE"

# 3. Prompt for Target Org/Repo
echo ""
echo "Enter the GitHub clone URL for the NSV repository."
echo "Examples:"
echo "  - https://github.com/NorthShoreVoice/scream.git"
echo "  - https://github.com/NSV-Org/somatics.git"
echo "  - git@github.com:NorthShoreVoice/transport.git"
echo ""
read -p "Repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "[ERROR] No URL provided. Aborting."
    exit 1
fi

# 4. Re-Align Remotes
echo ""
echo "[ACTION] Re-aligning Remotes..."

# Rename old origin to upstream if it was duncanthrax
if [[ "$CURRENT_REMOTE" == *"duncanthrax"* ]]; then
    echo "[INFO] Renaming 'origin' to 'upstream' (Legacy Source)..."
    git remote rename origin upstream
else
    echo "[INFO] Removing old origin..."
    git remote remove origin
fi

# Add new Origin
git remote add origin "$REPO_URL"
echo "[SUCCESS] New Origin Set: $REPO_URL"

# 5. Push Vanguard
echo ""
echo "[ACTION] Pushing Vanguard (Master)..."
git push -u origin master

echo ""
echo "[VANGUARD] Initialization Complete."
echo "The Body is Connected."
