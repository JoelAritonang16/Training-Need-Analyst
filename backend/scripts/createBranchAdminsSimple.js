import sequelize from '../db/db.js';
import bcrypt from 'bcryptjs';

const createBranchAdmins = async () => {
  try {
    console.log('Creating admin accounts for each branch...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Get all branches using raw query
    const [branches] = await sequelize.query('SELECT * FROM branch ORDER BY nama ASC');
    console.log(`Found ${branches.length} branches in database`);
    
    // Check if default anak perusahaan exists
    const [anakPerusahaan] = await sequelize.query(
      "SELECT * FROM anak_perusahaan WHERE nama = 'PT Pelindo (Persero)' LIMIT 1"
    );
    
    let anakPerusahaanId;
    if (anakPerusahaan.length === 0) {
      // Create default anak perusahaan
      const [result] = await sequelize.query(
        "INSERT INTO anak_perusahaan (nama, created_at, updated_at) VALUES (?, NOW(), NOW())",
        { replacements: ['PT Pelindo (Persero)'] }
      );
      anakPerusahaanId = result.insertId;
      console.log('✓ Created default Anak Perusahaan: PT Pelindo (Persero)');
    } else {
      anakPerusahaanId = anakPerusahaan[0].id;
      console.log('✓ Using existing Anak Perusahaan: PT Pelindo (Persero)');
    }
    
    const createdAdmins = [];
    const skippedAdmins = [];
    
    // Create admin for each branch
    for (const branch of branches) {
      try {
        // Generate username based on branch name
        const branchNameClean = branch.nama
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        
        const adminUsername = `admin_${branchNameClean}`;
        const defaultPassword = 'admin123';
        
        // Check if admin already exists
        const [existingUser] = await sequelize.query(
          'SELECT * FROM users WHERE username = ? LIMIT 1',
          { replacements: [adminUsername] }
        );
        
        if (existingUser.length > 0) {
          console.log(`Admin already exists: ${adminUsername} (${branch.nama})`);
          skippedAdmins.push({
            branch: branch.nama,
            username: adminUsername,
            reason: 'already exists'
          });
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        // Create admin user
        await sequelize.query(
          `INSERT INTO users (username, password, role, fullName, email, unit, branchId, anakPerusahaanId, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          { 
            replacements: [
              adminUsername,
              hashedPassword,
              'admin',
              `Admin ${branch.nama}`,
              `${adminUsername}@pelindo.com`,
              branch.nama,
              branch.id,
              anakPerusahaanId
            ] 
          }
        );
        
        createdAdmins.push({
          username: adminUsername,
          branch: branch.nama,
          branchId: branch.id,
          password: defaultPassword
        });
        
        console.log(`✓ Created admin: ${adminUsername} for branch "${branch.nama}"`);
        
      } catch (error) {
        console.error(`✗ Failed to create admin for branch "${branch.nama}":`, error.message);
        skippedAdmins.push({
          branch: branch.nama,
          username: `admin_${branch.nama.toLowerCase()}`,
          reason: error.message
        });
      }
    }
    
    console.log('');
    console.log('=== BRANCH ADMIN CREATION COMPLETED ===');
    console.log(`Successfully created ${createdAdmins.length} admin accounts`);
    console.log(`Skipped ${skippedAdmins.length} accounts`);
    console.log('');
    
    if (createdAdmins.length > 0) {
      console.log('Created Admin Accounts:');
      console.log('Username\t\t\tBranch\t\t\t\tPassword');
      console.log('─'.repeat(80));
      createdAdmins.forEach(admin => {
        const username = admin.username.padEnd(25);
        const branch = admin.branch.padEnd(25);
        console.log(`${username}\t${branch}\t${admin.password}`);
      });
      console.log('');
      console.log('IMPORTANT: Please change default passwords after first login!');
    }
    
    if (skippedAdmins.length > 0) {
      console.log('');
      console.log('Skipped Accounts:');
      skippedAdmins.forEach(admin => {
        console.log(`   - ${admin.username} (${admin.branch}): ${admin.reason}`);
      });
    }
    
    return {
      success: true,
      message: 'Branch admin creation completed',
      created: createdAdmins.length,
      skipped: skippedAdmins.length,
      total: branches.length,
      admins: createdAdmins
    };
    
  } catch (error) {
    console.error('Branch admin creation error:', error);
    return {
      success: false,
      message: 'Failed to create branch admins',
      error: error.message
    };
  } finally {
    await sequelize.close();
  }
};

// Run the function
createBranchAdmins()
  .then((result) => {
    console.log('');
    console.log('Branch admin creation process finished!');
    console.log(`Result: ${result.message}`);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Branch admin creation process failed:', error);
    process.exit(1);
  });
