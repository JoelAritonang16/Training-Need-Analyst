import seedBranches from './branchSeeder.js';
import seedDivisi from './divisiSeeder.js';
import sequelize from '../db/db.js';

const runMasterSeeder = async () => {
  try {
    console.log('=== STARTING MASTER SEEDER ===');
    console.log('Connecting to database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync();
    console.log('✓ Database synchronized');
    
    // Run seeders
    console.log('\n--- Running Branch Seeder ---');
    const branchResult = await seedBranches();
    console.log('Branch seeder result:', branchResult.message);
    
    console.log('\n--- Running Divisi Seeder ---');
    const divisiResult = await seedDivisi();
    console.log('Divisi seeder result:', divisiResult.message);
    
    console.log('\n=== MASTER SEEDER COMPLETED ===');
    console.log('Summary:');
    console.log(`- Branches: ${branchResult.count || 0} records`);
    console.log(`- Divisi: ${divisiResult.count || 0} records`);
    
    return {
      success: true,
      message: 'Master seeding completed successfully',
      results: {
        branches: branchResult,
        divisi: divisiResult
      }
    };
    
  } catch (error) {
    console.error('Master seeder error:', error);
    return {
      success: false,
      message: 'Master seeding failed',
      error: error.message
    };
  }
};

// Run seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMasterSeeder()
    .then((result) => {
      console.log('\nSeeding process finished:', result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Seeding process failed:', error);
      process.exit(1);
    });
}

export default runMasterSeeder;
