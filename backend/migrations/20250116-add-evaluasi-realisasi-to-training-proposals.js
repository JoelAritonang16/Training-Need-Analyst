import sequelize from '../db/db.js';

const addEvaluasiRealisasiToTrainingProposals = async () => {
  try {
    console.log('=== MIGRATION: Adding evaluasiRealisasi field to training_proposals ===');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'training_proposals' 
      AND COLUMN_NAME = 'evaluasiRealisasi'
    `);
    
    if (results.length === 0) {
      console.log('Adding evaluasiRealisasi column...');
      await sequelize.query(`
        ALTER TABLE training_proposals 
        ADD COLUMN evaluasiRealisasi TEXT NULL
        COMMENT 'Evaluasi realisasi proposal yang diisi saat konfirmasi realisasi'
      `);
      console.log('✓ evaluasiRealisasi column added successfully');
    } else {
      console.log('✓ evaluasiRealisasi column already exists');
    }
    
    console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY ===');
    console.log('evaluasiRealisasi field has been added to training_proposals table');
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

// Run migration
addEvaluasiRealisasiToTrainingProposals()
  .then(() => {
    console.log('\nMigration finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });

