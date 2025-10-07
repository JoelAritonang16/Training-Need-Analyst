import sequelize from '../db/db.js';

async function runMigration() {
  try {
    console.log('Starting migration: Add profile fields to users table...');
    console.log('Connecting to database...');
    
    // Wait for connection
    await sequelize.authenticate();
    console.log('Database connected successfully!');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Check if columns already exist
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.fullName) {
      await queryInterface.addColumn('users', 'fullName', {
        type: sequelize.Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nama lengkap user'
      });
      console.log('✓ Added fullName column');
    } else {
      console.log('- fullName column already exists');
    }
    
    if (!tableDescription.email) {
      await queryInterface.addColumn('users', 'email', {
        type: sequelize.Sequelize.STRING(100),
        allowNull: true,
        comment: 'Email user'
      });
      console.log('✓ Added email column');
    } else {
      console.log('- email column already exists');
    }
    
    if (!tableDescription.phone) {
      await queryInterface.addColumn('users', 'phone', {
        type: sequelize.Sequelize.STRING(20),
        allowNull: true,
        comment: 'Nomor telepon user'
      });
      console.log('✓ Added phone column');
    } else {
      console.log('- phone column already exists');
    }
    
    if (!tableDescription.unit) {
      await queryInterface.addColumn('users', 'unit', {
        type: sequelize.Sequelize.STRING(100),
        allowNull: true,
        comment: 'Unit/Divisi user'
      });
      console.log('✓ Added unit column');
    } else {
      console.log('- unit column already exists');
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
