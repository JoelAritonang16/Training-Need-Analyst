import db from '../models/index.js';

const verifyNotificationsTable = async () => {
  try {
    console.log('=== Verifying Notifications Table ===');
    
    // Initialize database connection
    await db.initDatabase();
    
    // Check if Notification model is registered
    if (db.Notification) {
      console.log('✅ Notification model is registered');
    } else {
      console.log('❌ Notification model is NOT registered');
      return;
    }
    
    // Try to query the table
    try {
      const count = await db.Notification.count();
      console.log(`✅ Notifications table exists and is accessible`);
      console.log(`   Current notifications count: ${count}`);
    } catch (error) {
      console.log('❌ Error accessing notifications table:', error.message);
      console.log('   This might mean the table needs to be created');
      console.log('   Please restart the backend server to create the table');
    }
    
    // Check table structure
    try {
      const tableInfo = await db.sequelize.getQueryInterface().describeTable('notifications');
      console.log('\n📋 Table Structure:');
      console.log('   Columns:', Object.keys(tableInfo).join(', '));
    } catch (error) {
      console.log('⚠️  Could not get table structure:', error.message);
    }
    
    console.log('\n=== Verification Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
};

verifyNotificationsTable();

