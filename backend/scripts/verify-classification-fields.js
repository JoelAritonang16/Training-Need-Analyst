import sequelize from '../db/db.js';

const verifyClassificationFields = async () => {
  try {
    console.log('=== VERIFYING CLASSIFICATION FIELDS ===\n');
    
    // Check if columns exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'training_proposals' 
      AND COLUMN_NAME IN ('Jenis', 'ProgramInisiatifStrategis', 'ClusterUtama', 'ClusterKecil')
      ORDER BY COLUMN_NAME
    `);
    
    console.log('Found columns:');
    console.log('----------------------------------------');
    results.forEach(col => {
      console.log(`✓ ${col.COLUMN_NAME}`);
      console.log(`  Type: ${col.COLUMN_TYPE}`);
      console.log(`  Nullable: ${col.IS_NULLABLE}`);
      console.log('');
    });
    
    if (results.length === 4) {
      console.log('✅ SUCCESS: All 4 classification fields are present in the database!');
    } else {
      console.log(`⚠️  WARNING: Expected 4 columns, but found ${results.length}`);
    }
    
    // Check sample data
    const [sampleData] = await sequelize.query(`
      SELECT id, Uraian, Jenis, ProgramInisiatifStrategis, ClusterUtama, ClusterKecil
      FROM training_proposals
      LIMIT 3
    `);
    
    if (sampleData.length > 0) {
      console.log('\n=== SAMPLE DATA ===');
      sampleData.forEach((row, idx) => {
        console.log(`\nProposal #${idx + 1} (ID: ${row.id}):`);
        console.log(`  Uraian: ${row.Uraian || '-'}`);
        console.log(`  Jenis: ${row.Jenis || '-'}`);
        console.log(`  Program Inisiatif Strategis: ${row.ProgramInisiatifStrategis || '-'}`);
        console.log(`  Cluster Utama: ${row.ClusterUtama || '-'}`);
        console.log(`  Cluster Kecil: ${row.ClusterKecil || '-'}`);
      });
    }
    
    console.log('\n=== VERIFICATION COMPLETED ===');
    
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
};

// Run verification
verifyClassificationFields()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });

