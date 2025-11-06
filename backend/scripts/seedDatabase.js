import runMasterSeeder from '../seeders/masterSeeder.js';

console.log('Starting database seeding process...');
console.log('This will populate the database with initial Branch and Divisi data.');
console.log('');

runMasterSeeder()
  .then((result) => {
    if (result.success) {
      console.log('');
      console.log('Database seeding completed successfully!');
      console.log('');
      console.log('Summary:');
      console.log(`   Branches: ${result.results.branches.count || 0} new, ${result.results.branches.skipped || 0} existing, ${result.results.branches.total || 0} total`);
      console.log(`   Divisi: ${result.results.divisi.count || 0} new, ${result.results.divisi.skipped || 0} existing, ${result.results.divisi.total || 0} total`);
      
      console.log('');
      console.log('Your database is now ready with Branch and Divisi data!');
      console.log('   You can now create users and assign them to specific branches and divisions.');
    } else {
      console.log('');
      console.log('Database seeding failed!');
      console.log('Error:', result.message);
      if (result.error) {
        console.log('Details:', result.error);
      }
    }
  })
  .catch((error) => {
    console.log('');
    console.log('💥 Unexpected error during seeding:');
    console.error(error);
  })
  .finally(() => {
    process.exit(0);
  });
