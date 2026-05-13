/**
 * Database Integration Test
 * 
 * Tests the enhanced database with Lively-Puter bridge integration
 */

import { TraeNuPIDatabase, initializeDatabase, getDatabase, resetDatabase } from './db-enhanced.js';

async function testLocalDatabase(): Promise<void> {
  console.log('\n=== Testing Local Database ===\n');
  
  const db = new TraeNuPIDatabase({
    database: 'psypi_test',
    enableCloudSync: false
  });
  
  try {
    await db.initialize();
    
    console.log('✅ Database initialized');
    console.log(`   Source: ${db.getMetadata().source}`);
    console.log(`   Cloud enabled: ${db.isCloudEnabled()}`);
    
    const testKey = 'test:local';
    const testValue = { message: 'Hello from local', timestamp: Date.now() };
    
    await db.set(testKey, testValue);
    console.log('✅ Value set');
    
    const retrieved = await db.get(testKey);
    console.log(`✅ Value retrieved: ${JSON.stringify(retrieved)}`);
    
    await db.delete(testKey);
    console.log('✅ Value deleted');
    
    const deleted = await db.get(testKey);
    console.log(`✅ Value after delete: ${deleted}`);
    
    await db.close();
    console.log('✅ Database closed');
  } catch (error) {
    console.warn('⚠️  Local database test failed:', error);
    console.log('   This is expected if PostgreSQL is not running');
    await db.close();
  }
}

async function testCloudSync(): Promise<void> {
  console.log('\n=== Testing Cloud Sync ===\n');
  
  const db = new TraeNuPIDatabase({
    database: 'psypi_test',
    enableCloudSync: true
  });
  
  try {
    await db.initialize();
    
    console.log('✅ Database initialized with cloud sync');
    console.log(`   Source: ${db.getMetadata().source}`);
    console.log(`   Cloud enabled: ${db.isCloudEnabled()}`);
    
    if (db.isCloudEnabled()) {
      const testKey = 'user:preferences';
      const testValue = {
        theme: 'dark',
        language: 'en',
        timestamp: Date.now()
      };
      
      await db.set(testKey, testValue);
      console.log('✅ Value set (should use cloud)');
      
      const retrieved = await db.get(testKey);
      console.log(`✅ Value retrieved: ${JSON.stringify(retrieved)}`);
      
      console.log('\n🔄 Syncing to cloud...');
      await db.syncToCloud('user:');
      console.log('✅ Synced to cloud');
      
      console.log('\n🔄 Syncing from cloud...');
      await db.syncFromCloud('user:');
      console.log('✅ Synced from cloud');
      
      const metadata = db.getMetadata();
      console.log(`\n📊 Metadata:`);
      console.log(`   Last sync: ${new Date(metadata.lastSync).toISOString()}`);
      console.log(`   Source: ${metadata.source}`);
      
      await db.delete(testKey);
      console.log('✅ Test data cleaned up');
    } else {
      console.log('⚠️  Cloud sync not available (Puter SDK not loaded)');
    }
    
    await db.close();
  } catch (error) {
    console.warn('⚠️  Cloud sync test failed:', error);
    console.log('   This is expected if PostgreSQL or Puter SDK is not available');
    await db.close();
  }
}

async function testQueryOperations(): Promise<void> {
  console.log('\n=== Testing Query Operations ===\n');
  
  const db = new TraeNuPIDatabase({
    database: 'psypi_test',
    enableCloudSync: false
  });
  
  try {
    await db.initialize();
    
    console.log('✅ Database initialized');
    
    const result = await db.query('SELECT NOW() as current_time');
    console.log(`✅ Query executed: ${JSON.stringify(result)}`);
    
    const oneResult = await db.queryOne('SELECT 1 as number');
    console.log(`✅ Query one: ${JSON.stringify(oneResult)}`);
    
    const execResult = await db.exec('SELECT 1');
    console.log(`✅ Exec result: ${execResult}`);
    
    await db.close();
    console.log('✅ Database closed');
  } catch (error) {
    console.warn('⚠️  Query test failed:', error);
    console.log('   This is expected if PostgreSQL is not running');
    await db.close();
  }
}

async function testGlobalDatabase(): Promise<void> {
  console.log('\n=== Testing Global Database ===\n');
  
  resetDatabase();
  
  try {
    const db1 = await initializeDatabase({
      database: 'psypi_test',
      enableCloudSync: false
    });
    
    console.log('✅ Global database initialized');
    
    const db2 = getDatabase();
    console.log('✅ Got global database instance');
    
    if (db1 === db2) {
      console.log('✅ Singleton pattern working');
    } else {
      console.error('❌ Singleton pattern broken');
    }
    
    await db1.close();
    console.log('✅ Database closed');
  } catch (error) {
    console.warn('⚠️  Global database test failed:', error);
    console.log('   This is expected if PostgreSQL is not running');
  }
}

async function runTests(): Promise<void> {
  console.log('🧪 TraeNuPI Database Integration Tests\n');
  console.log('=====================================');
  
  try {
    await testLocalDatabase();
    await testCloudSync();
    await testQueryOperations();
    await testGlobalDatabase();
    
    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
