const { execFile } = require('child_process');

const cwd = 'C:\\Users\\id_30\\ai-stock-platform';
const prompt = 'Read file .task-ui-redesign.md and execute ALL tasks described in it. This is a UI redesign project for an AI Stock Platform.';

const claude = execFile('C:\\Users\\id_30\\AppData\\Roaming\\npm\\claude.cmd', [
  '--permission-mode', 'bypassPermissions',
  '--print',
  prompt
], { cwd, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  process.exit(0);
});

claude.on('error', (err) => {
  console.error('Spawn error:', err.message);
  process.exit(1);
});
