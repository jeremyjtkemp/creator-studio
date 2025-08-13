#!/usr/bin/env node

/**
 * Super Simple Creator Studio Startup
 * Just start the servers, no complexity!
 */

import { spawn } from 'child_process';

console.log('🚀 Starting Creator Studio...\n');

// Kill any existing processes on our ports
console.log('🧹 Cleaning up any existing processes...');

// Start the servers
const child = spawn('npx', [
  'concurrently',
  '-c', 'blue,green', 
  '-n', 'server,frontend',
  '--kill-others',
  '"cd server && pnpm dev"',
  '"cd ui && pnpm dev"'
], {
  stdio: 'inherit',
  shell: true
});

// Show info
setTimeout(() => {
  console.log('\n🎉 Creator Studio is starting up!');
  console.log('📍 Frontend: http://localhost:3000');
  console.log('📍 Backend:  http://localhost:8787'); 
  console.log('\nPress Ctrl+C to stop all servers\n');
}, 2000);

// Cleanup on exit
const cleanup = () => {
  console.log('\n🛑 Shutting down all servers...');
  child.kill('SIGTERM');
  setTimeout(() => process.exit(0), 1000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

child.on('exit', (code) => {
  if (code !== 0) {
    console.log(`\n❌ Servers stopped with error code ${code}`);
  }
  process.exit(code);
});
