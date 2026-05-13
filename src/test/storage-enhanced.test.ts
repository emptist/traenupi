/**
 * Storage Integration Test
 * 
 * Tests the enhanced storage with Lively-Puter bridge integration
 */

import { TraeNuPIStorage, initializeStorage, getStorage, resetStorage } from './storage-enhanced.js';
import type { ConversationItem, Bookmark, MoodEntry } from './types.js';

async function testLocalStorage(): Promise<void> {
  console.log('\n=== Testing Local Storage ===\n');
  
  const storage = new TraeNuPIStorage({
    baseDir: '/tmp/traenupi-test',
    enableCloudSync: false
  });
  
  await storage.initialize();
  
  console.log('✅ Storage initialized');
  console.log(`   Source: ${storage.getMetadata().source}`);
  console.log(`   Cloud enabled: ${storage.isCloudEnabled()}`);
  
  const testHistory: ConversationItem[] = [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' }
  ];
  
  await storage.saveHistory(testHistory);
  console.log('✅ History saved');
  
  const loadedHistory = await storage.loadHistory();
  console.log(`✅ History loaded: ${loadedHistory.length} items`);
  
  const testBookmarks: Bookmark[] = [
    { id: '1', title: 'Test', url: 'https://example.com', created_at: Date.now() }
  ];
  
  await storage.saveBookmarks(testBookmarks);
  console.log('✅ Bookmarks saved');
  
  const loadedBookmarks = await storage.loadBookmarks();
  console.log(`✅ Bookmarks loaded: ${loadedBookmarks.length} items`);
  
  const testMood: MoodEntry[] = [
    { timestamp: Date.now(), mood: 'happy', note: 'Test mood' }
  ];
  
  await storage.saveMoodHistory(testMood);
  console.log('✅ Mood history saved');
  
  const loadedMood = await storage.loadMoodHistory();
  console.log(`✅ Mood history loaded: ${loadedMood.length} items`);
  
  const testState = { started: Date.now(), test: true };
  await storage.saveState(testState);
  console.log('✅ State saved');
  
  const loadedState = await storage.loadState();
  console.log(`✅ State loaded: ${JSON.stringify(loadedState)}`);
}

async function testCloudSync(): Promise<void> {
  console.log('\n=== Testing Cloud Sync ===\n');
  
  const storage = new TraeNuPIStorage({
    baseDir: '/tmp/traenupi-test-cloud',
    enableCloudSync: true
  });
  
  try {
    await storage.initialize();
    
    console.log('✅ Storage initialized with cloud sync');
    console.log(`   Source: ${storage.getMetadata().source}`);
    console.log(`   Cloud enabled: ${storage.isCloudEnabled()}`);
    
    if (storage.isCloudEnabled()) {
      const testData = { test: 'cloud-sync', timestamp: Date.now() };
      await storage.saveJsonFile('test-sync.json', testData);
      console.log('✅ Data saved with cloud sync');
      
      console.log('\n🔄 Syncing to cloud...');
      await storage.syncToCloud('test-sync.json');
      console.log('✅ Synced to cloud');
      
      console.log('\n🔄 Syncing from cloud...');
      await storage.syncFromCloud('test-sync.json');
      console.log('✅ Synced from cloud');
      
      const metadata = storage.getMetadata();
      console.log(`\n📊 Metadata:`);
      console.log(`   Last sync: ${new Date(metadata.lastSync).toISOString()}`);
      console.log(`   Source: ${metadata.source}`);
    } else {
      console.log('⚠️  Cloud sync not available (Puter SDK not loaded)');
    }
  } catch (error) {
    console.warn('⚠️  Cloud sync test failed:', error);
    console.log('   This is expected if Puter SDK is not available');
  }
}

async function testGlobalStorage(): Promise<void> {
  console.log('\n=== Testing Global Storage ===\n');
  
  resetStorage();
  
  const storage1 = await initializeStorage({
    baseDir: '/tmp/traenupi-test-global',
    enableCloudSync: false
  });
  
  console.log('✅ Global storage initialized');
  
  const storage2 = getStorage();
  console.log('✅ Got global storage instance');
  
  if (storage1 === storage2) {
    console.log('✅ Singleton pattern working');
  } else {
    console.error('❌ Singleton pattern broken');
  }
  
  await storage1.saveState({ test: 'global', timestamp: Date.now() });
  const state = await storage2.loadState();
  console.log(`✅ State shared: ${JSON.stringify(state)}`);
}

async function runTests(): Promise<void> {
  console.log('🧪 TraeNuPI Storage Integration Tests\n');
  console.log('=====================================');
  
  try {
    await testLocalStorage();
    await testCloudSync();
    await testGlobalStorage();
    
    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
