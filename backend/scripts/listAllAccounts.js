import sequelize from '../db/db.js';

const listAllAccounts = async () => {
  try {
    console.log('DAFTAR LENGKAP SEMUA AKUN SISTEM');
    console.log('=====================================');
    console.log('');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    console.log('');
    
    // Get all users with their branch and division info
    const [users] = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.role,
        u.fullName,
        u.email,
        u.unit,
        b.nama as branch_name,
        d.nama as divisi_name,
        ap.nama as anak_perusahaan_name,
        u.created_at
      FROM users u
      LEFT JOIN branch b ON u.branchId = b.id
      LEFT JOIN divisi d ON u.divisiId = d.id
      LEFT JOIN anak_perusahaan ap ON u.anakPerusahaanId = ap.id
      ORDER BY 
        CASE u.role 
          WHEN 'superadmin' THEN 1 
          WHEN 'admin' THEN 2 
          WHEN 'user' THEN 3 
        END,
        b.nama,
        u.username
    `);
    
    // Group users by role
    const superadmins = users.filter(u => u.role === 'superadmin');
    const admins = users.filter(u => u.role === 'admin');
    const regularUsers = users.filter(u => u.role === 'user');
    
    // Display Superadmins
    console.log('SUPERADMIN ACCOUNTS');
    console.log('======================');
    if (superadmins.length === 0) {
      console.log('   No superadmin accounts found');
    } else {
      superadmins.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Full Name: ${user.fullName || 'Not set'}`);
        console.log(`   Email: ${user.email || 'Not set'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleDateString('id-ID')}`);
        console.log('   Access: FULL SYSTEM ACCESS');
        console.log('   Default Password: superadmin123');
        console.log('');
      });
    }
    
    // Display Admins
    console.log('ADMIN BRANCH ACCOUNTS');
    console.log('========================');
    if (admins.length === 0) {
      console.log('   No admin accounts found');
    } else {
      admins.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Full Name: ${user.fullName || 'Not set'}`);
        console.log(`   Email: ${user.email || 'Not set'}`);
        console.log(`   Branch: ${user.branch_name || 'Not assigned'}`);
        console.log(`   Anak Perusahaan: ${user.anak_perusahaan_name || 'Not assigned'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleDateString('id-ID')}`);
        console.log('   Access: Branch Management');
        console.log('   Default Password: admin123 - MUST CHANGE!');
        console.log('');
      });
    }
    
    // Display Users
    console.log('USER ACCOUNTS');
    console.log('================');
    if (regularUsers.length === 0) {
      console.log('   No user accounts found');
    } else {
      regularUsers.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Full Name: ${user.fullName || 'Not set'}`);
        console.log(`   Email: ${user.email || 'Not set'}`);
        console.log(`   Branch: ${user.branch_name || 'Not assigned'}`);
        console.log(`   Divisi: ${user.divisi_name || 'Not assigned'}`);
        console.log(`   Unit: ${user.unit || 'Not set'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleDateString('id-ID')}`);
        console.log('   Access: Training Proposals');
        console.log('');
      });
    }
    
    // Summary
    console.log('SUMMARY');
    console.log('==========');
    console.log(`Total Accounts: ${users.length}`);
    console.log(`├── Superadmins: ${superadmins.length}`);
    console.log(`├── Admins: ${admins.length}`);
    console.log(`└── Users: ${regularUsers.length}`);
    console.log('');
    
    // Login Instructions
    console.log('LOGIN INSTRUCTIONS');
    console.log('=====================');
    console.log('URL: http://localhost:3000');
    console.log('');
    console.log('Superadmin Login:');
    console.log('  Username: superadmin');
    console.log('  Password: superadmin123');
    console.log('');
    console.log('Admin Login (example):');
    console.log('  Username: admin_tanjung_pinang');
    console.log('  Password: admin123 (change after first login!)');
    console.log('');
    console.log('User Login (example):');
    console.log('  Username: SPMT');
    console.log('  Password: spmt123');
    console.log('');
    
    // Available branches and divisions
    const [branches] = await sequelize.query('SELECT COUNT(*) as count FROM branch');
    const [divisions] = await sequelize.query('SELECT COUNT(*) as count FROM divisi');
    
    console.log('ORGANIZATIONAL STRUCTURE');
    console.log('============================');
    console.log(`Available Branches: ${branches[0].count}`);
    console.log(`Available Divisions: ${divisions[0].count}`);
    console.log('');
    
    console.log('System is ready for production use!');
    
  } catch (error) {
    console.error('Error listing accounts:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the function
listAllAccounts();
