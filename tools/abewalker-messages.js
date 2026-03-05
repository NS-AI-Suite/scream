const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Configuration
const HOME_DIR = os.homedir();
const DB_PATH = path.join(HOME_DIR, 'Library/Messages/chat.db');
const LIMIT = 20;

// Query to get recent messages
// We join message with handle to get the sender info
// We handle proper date conversion (Cocoa Core Data timestamp starts Jan 1 2001)
const SQL_QUERY = `
SELECT
    message.date,
    message.is_from_me,
    message.text,
    handle.id AS handle_id
FROM
    message
LEFT JOIN
    handle ON message.handle_id = handle.ROWID
ORDER BY
    message.date DESC
LIMIT ${LIMIT};
`;

function runQuery() {
    console.log(`[abewalker] Connecting to Neural Link: ${DB_PATH}`);

    const sqlite3 = spawn('sqlite3', [DB_PATH, SQL_QUERY, '-header', '-csv']);

    let stdoutData = '';
    let stderrData = '';

    sqlite3.stdout.on('data', (data) => {
        stdoutData += data.toString();
    });

    sqlite3.stderr.on('data', (data) => {
        stderrData += data.toString();
    });

    sqlite3.on('close', (code) => {
        if (code !== 0) {
            console.error(`[abewalker] Error accessing nervous system (Exit Code ${code})`);
            console.error(`[abewalker] STDERR: ${stderrData}`);
            
            if (stderrData.includes('Operation not permitted')) {
                console.log('\n--- PERMISSION REQUIRED ---');
                console.log('The Agent needs permission to access your Messages.');
                console.log('1. Open System Settings -> Privacy & Security -> Full Disk Access');
                console.log('2. Add/Enable "Terminal" (or VS Code / Node)');
                console.log('---------------------------\n');
            }
            return;
        }

        if (stdoutData.trim() === '') {
            console.log('[abewalker] No signals detected. (Empty Query Result)');
            return;
        }

        console.log('[abewalker] Signal Accepted. Parsing...');
        const lines = stdoutData.trim().split('\n');
        
        // Simple CSV Parsing
        try {
            // First line is header, usually
            const headers = lines[0].split(',');
            // Mapping indices
            // We know the SELECT order, but dynamic is better if we change query. 
            // For now, let's stick to the known index for robustness against CSV commas in text.
            // Actually, sqlite3 -csv handles quoting. We need a proper CSV parser or a simpler separator.
            // Let's re-run with a pipe separator to avoid common CSV issues quickly, or just regex.
            
            // To be safe, let's just print the raw output first to validate the link.
            console.log('\n--- INCOMING TRANSMISSION ---');
            lines.forEach((line, index) => {
                if(index === 0) return; // Skip header
                // Basic cleanup for display
                console.log(line);
            });
            console.log('--- END TRANSMISSION ---\n');

        } catch (e) {
            console.error('[abewalker] Parsing Interrupted:', e);
        }
    });
}

// Check for DB existence
if (!fs.existsSync(DB_PATH)) {
    console.error(`[abewalker] Critical Error: Neural Link not found at ${DB_PATH}`);
    process.exit(1);
}

runQuery();
