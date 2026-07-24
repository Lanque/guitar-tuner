import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

run('npm', ['run', 'build']);

// Windows can lock renames inside Documents while Electron is unpacked.
// Build in the system temp directory, then copy only the finished executable.
const buildOutput = path.join(tmpdir(), 'guitar-tuner-desktop-build');
await rm(buildOutput, { force: true, recursive: true });
run('npx', [
  'electron-builder',
  '--win',
  'portable',
  '--publish',
  'never',
  `--config.directories.output=${buildOutput}`,
]);

const artifact = (await readdir(buildOutput)).find(
  (entry) => entry.startsWith('Guitar-Tuner-') && entry.endsWith('.exe'),
);

if (!artifact) {
  throw new Error('Desktop build completed without an executable artifact.');
}

await mkdir('release', { recursive: true });
await cp(path.join(buildOutput, artifact), path.join('release', artifact), { force: true });

function run(command, args) {
  const result = spawnSync(command, args, {
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
