import sequelize from '../db/db.js';

const addBranchIdToTrainingProposals = async () => {
  try {
    console.log('Adding branchId column to training_proposals table...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'training_proposals' 
      AND COLUMN_NAME = 'branchId'
    `);
    
    if (results.length > 0) {
      console.log('Column branchId already exists in training_proposals table');
      return;
    }
    
    // Add branchId column
    await sequelize.query(`
      ALTER TABLE training_proposals 
      ADD COLUMN branchId INT NULL,
      ADD CONSTRAINT fk_training_proposals_branch 
      FOREIGN KEY (branchId) REFERENCES branch(id) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
    
    console.log('Successfully added branchId column to training_proposals table');
    
    // Update existing proposals with branchId from their users
    console.log('Updating existing proposals with branchId from users...');
    await sequelize.query(`
      UPDATE training_proposals tp
      INNER JOIN users u ON tp.userId = u.id
      SET tp.branchId = u.branchId
      WHERE tp.branchId IS NULL AND u.branchId IS NOT NULL
    `);
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

// Run migration
addBranchIdToTrainingProposals()
  .then(() => {
    console.log('Migration finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
