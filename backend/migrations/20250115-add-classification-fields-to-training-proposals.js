import sequelize from '../db/db.js';

const addClassificationFieldsToTrainingProposals = async () => {
  try {
    console.log('=== MIGRATION: Adding classification fields to training_proposals ===');
    
    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'training_proposals' 
      AND COLUMN_NAME IN ('Jenis', 'ProgramInisiatifStrategis', 'ClusterUtama', 'ClusterKecil')
    `);
    
    const existingColumns = results.map(r => r.COLUMN_NAME);
    console.log('Existing columns:', existingColumns);
    
    // Add Jenis column (ENUM)
    if (!existingColumns.includes('Jenis')) {
      console.log('Adding Jenis column...');
      await sequelize.query(`
        ALTER TABLE training_proposals 
        ADD COLUMN Jenis ENUM('Pelatihan', 'Workshop', 'Sertifikasi') NULL
      `);
      console.log('✓ Jenis column added successfully');
    } else {
      console.log('✓ Jenis column already exists');
    }
    
    // Add ProgramInisiatifStrategis column
    if (!existingColumns.includes('ProgramInisiatifStrategis')) {
      console.log('Adding ProgramInisiatifStrategis column...');
      await sequelize.query(`
        ALTER TABLE training_proposals 
        ADD COLUMN ProgramInisiatifStrategis VARCHAR(255) NULL
      `);
      console.log('✓ ProgramInisiatifStrategis column added successfully');
    } else {
      console.log('✓ ProgramInisiatifStrategis column already exists');
    }
    
    // Add ClusterUtama column
    if (!existingColumns.includes('ClusterUtama')) {
      console.log('Adding ClusterUtama column...');
      await sequelize.query(`
        ALTER TABLE training_proposals 
        ADD COLUMN ClusterUtama VARCHAR(255) NULL
      `);
      console.log('✓ ClusterUtama column added successfully');
    } else {
      console.log('✓ ClusterUtama column already exists');
    }
    
    // Add ClusterKecil column
    if (!existingColumns.includes('ClusterKecil')) {
      console.log('Adding ClusterKecil column...');
      await sequelize.query(`
        ALTER TABLE training_proposals 
        ADD COLUMN ClusterKecil VARCHAR(255) NULL
      `);
      console.log('✓ ClusterKecil column added successfully');
    } else {
      console.log('✓ ClusterKecil column already exists');
    }
    
    console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY ===');
    console.log('All classification fields have been added to training_proposals table');
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

// Run migration
addClassificationFieldsToTrainingProposals()
  .then(() => {
    console.log('\nMigration finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });

