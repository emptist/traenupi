// Lively-Puter Integration Example
// 
// This example demonstrates how to use the Lively-Puter bridge
// in TraeNuPI for unified access to Lively4 and Puter services.

import { LivelyPuterBridge } from '../src/common/lively-puter/index.js';

async function main() {
  console.log('🚀 Initializing Lively-Puter Bridge...\n');

  // Create and initialize the bridge
  const bridge = new LivelyPuterBridge({
    mode: 'hybrid', // Auto-detect best mode
    enableAuth: true,
    enableAI: true,
    enableStorage: true,
    enableDatabase: true
  });

  await bridge.initialize();
  
  console.log(`✅ Bridge initialized in ${bridge.getMode()} mode\n`);

  // === File System Example ===
  console.log('📁 Testing File System...\n');
  
  try {
    // Write a file (will be routed to Puter in hybrid mode)
    await bridge.fs.write('/documents/test.txt', 'Hello from TraeNuPI!');
    console.log('✓ File written to /documents/test.txt');
    
    // Read the file back
    const content = await bridge.fs.read('/documents/test.txt');
    console.log(`✓ File content: ${content}`);
    
    // Write a temporary file (will be routed to Lively4 in hybrid mode)
    await bridge.fs.write('/tmp/cache.json', JSON.stringify({ timestamp: Date.now() }));
    console.log('✓ Temporary file written to /tmp/cache.json');
    
    // List files
    const files = await bridge.fs.readdir('/documents');
    console.log(`✓ Found ${files.length} files in /documents`);
    
  } catch (error) {
    console.error('❌ File system error:', error.message);
  }

  // === AI Example ===
  console.log('\n🤖 Testing AI Services...\n');
  
  try {
    const response = await bridge.ai.chat([
      { role: 'user', content: 'What is the capital of France?' }
    ], {
      model: 'gpt-4',
      temperature: 0.7
    });
    
    console.log('✓ AI Response:', response.message.content);
    
  } catch (error) {
    console.error('❌ AI error:', error.message);
  }

  // === Database Example ===
  console.log('\n💾 Testing Database...\n');
  
  try {
    // Set a user setting (will be synced to both in hybrid mode)
    await bridge.db.set('user:preferences', {
      theme: 'dark',
      language: 'en'
    });
    console.log('✓ User preferences saved');
    
    // Get the value back
    const prefs = await bridge.db.get('user:preferences');
    console.log('✓ User preferences:', prefs);
    
    // Set a cache value (will be stored locally in hybrid mode)
    await bridge.db.set('cache:session', { lastAccess: Date.now() });
    console.log('✓ Cache saved locally');
    
    // List all user keys
    const userKeys = await bridge.db.list('user:');
    console.log(`✓ Found ${userKeys.length} user keys`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }

  // === Authentication Example ===
  console.log('\n🔐 Testing Authentication...\n');
  
  try {
    const isSignedIn = await bridge.auth.isSignedIn();
    
    if (!isSignedIn) {
      console.log('⚠️  Not signed in. Starting sign in flow...');
      const user = await bridge.auth.signIn();
      console.log('✓ Signed in as:', user.username);
    } else {
      const user = await bridge.auth.getUser();
      console.log('✓ Already signed in as:', user?.username);
    }
    
  } catch (error) {
    console.error('❌ Auth error:', error.message);
  }

  console.log('\n✅ Integration test complete!\n');
}

// Run the example
main().catch(console.error);
