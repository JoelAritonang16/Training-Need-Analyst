import sequelize from '../db/db.js';

const verifyData = async () => {
  try {
    console.log('Verifying database data...');
    console.log('');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Check branches
    const [branches] = await sequelize.query('SELECT COUNT(*) as count FROM branch');
    console.log(`Branches: ${branches[0].count} records`);
    
    // Check divisi
    const [divisi] = await sequelize.query('SELECT COUNT(*) as count FROM divisi');
    console.log(`Divisi: ${divisi[0].count} records`);
    
    // Check anak perusahaan
    const [anakPerusahaan] = await sequelize.query('SELECT COUNT(*) as count FROM anak_perusahaan');
    console.log(`🏭 Anak Perusahaan: ${anakPerusahaan[0].count} records`);
    
    // Check users by role
    const [users] = await sequelize.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `);
    
    console.log('Users by role:');
    users.forEach(user => {
      console.log(`   - ${user.role}: ${user.count} users`);
    });
    
    // Check admin users with their branches
    const [adminUsers] = await sequelize.query(`
      SELECT u.username, u.fullName, b.nama as branch_name
      FROM users u
      LEFT JOIN branch b ON u.branchId = b.id
      WHERE u.role = 'admin'
      ORDER BY b.nama
    `);
    
    console.log('');
    console.log('Admin accounts created:');
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.username} (${admin.branch_name})`);
    });
    
    console.log('');
    console.log('Database verification completed!');
    console.log('');
    console.log('Summary:');
    console.log(`   ${branches[0].count} branches available for user assignment`);
    console.log(`   ${divisi[0].count} divisions available for user assignment`);
    console.log(`   ${adminUsers.length} admin accounts ready for branch management`);
    console.log('');
    console.log('Next steps:');
    console.log('   1. Admin can now login using their branch-specific accounts');
    console.log('   2. Admin can create users and assign them to divisions within their branch');
    console.log('   3. Users will see their assigned branch and division in the system');
    console.log('   4. Default password for all admin accounts: admin123');
    console.log('   5. Please change default passwords after first login!');
    
  } catch (error) {
    console.error('Verification error:', error);
  } finally {
    await sequelize.close();
  }
};

// Run verification
verifyData();
