#!/usr/bin/env node

/**
 * Simple development server - No emulators, just works!
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Creator Studio (Simple Mode)...\n');

// Start database (PostgreSQL on standard port)
console.log('📦 Starting local PostgreSQL database...');

// Start backend server
console.log('⚡ Starting backend server on port 8787...');

// Start frontend
console.log('🎨 Starting frontend on port 3000...');

// Use concurrently to run both servers
const child = spawn('npx', [
  'concurrently',
  '-c', 'blue,green',
  '-n', 'server,frontend',
  '--handle-input',
  '"cd server && pnpm dev"',
  '"cd ui && pnpm dev"'
], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

// Cleanup on exit
const cleanup = () => {
  console.log('\n🛑 Shutting down...');
  if (child && !child.killed) {
    child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(0), 1000);
};

// Handle various exit signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

child.on('exit', (code) => {
  if (code !== 0) {
    console.log(`\n❌ Servers stopped with error code ${code}`);
  }
  process.exit(code);
});

child.on('error', (error) => {
  console.error('❌ Error starting servers:', error);
  process.exit(1);
});

console.log('\n🎉 Servers starting...');
console.log('📍 Frontend: http://localhost:3000');
console.log('📍 Backend:  http://localhost:8787');
console.log('📍 Database: PostgreSQL on localhost:5432');
console.log('\nPress Ctrl+C to stop\n');
