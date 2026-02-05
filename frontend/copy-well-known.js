import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

try {
  console.log('📁 Copying .well-known directory...');
  
  mkdirSync('dist/.well-known', { recursive: true });
  
  copyFileSync(
    'public/.well-known/farcaster.json',
    'dist/.well-known/farcaster.json'
  );
  
  console.log('✅ Successfully copied farcaster.json to dist/.well-known/');
} catch (err) {
  console.error('❌ Failed to copy .well-known:', err);
  process.exit(1);
}
