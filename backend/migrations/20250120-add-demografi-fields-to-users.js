import sequelize from '../db/db.js';

const addDemografiFieldsToUsers = async () => {
  try {
    console.log('=== MIGRATION: Adding demografi fields to users table ===');
    
    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('jenisKelamin', 'pendidikan', 'jenisPekerja', 'pusatPelayanan')
    `);
    
    const existingColumns = results.map(r => r.COLUMN_NAME);
    console.log('Existing columns:', existingColumns);
    
    // Add jenisKelamin column (ENUM)
    if (!existingColumns.includes('jenisKelamin')) {
      console.log('Adding jenisKelamin column...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN jenisKelamin ENUM('Laki-laki', 'Perempuan') NULL 
        COMMENT 'Jenis kelamin user'
      `);
      console.log('✓ jenisKelamin column added successfully');
    } else {
      console.log('✓ jenisKelamin column already exists');
    }
    
    // Add pendidikan column (ENUM)
    if (!existingColumns.includes('pendidikan')) {
      console.log('Adding pendidikan column...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN pendidikan ENUM('SMA', 'Diploma', 'S1', 'S2', 'S3') NULL 
        COMMENT 'Tingkat pendidikan user'
      `);
      console.log('✓ pendidikan column added successfully');
    } else {
      console.log('✓ pendidikan column already exists');
    }
    
    // Add jenisPekerja column (ENUM)
    if (!existingColumns.includes('jenisPekerja')) {
      console.log('Adding jenisPekerja column...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN jenisPekerja ENUM('Organik', 'Non Organik') NULL 
        COMMENT 'Jenis pekerja (Organik/Non Organik)'
      `);
      console.log('✓ jenisPekerja column added successfully');
    } else {
      console.log('✓ jenisPekerja column already exists');
    }
    
    // Add pusatPelayanan column (ENUM)
    if (!existingColumns.includes('pusatPelayanan')) {
      console.log('Adding pusatPelayanan column...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN pusatPelayanan ENUM('Operasional', 'Non Operasional') NULL 
        COMMENT 'Pusat pelayanan (Operasional/Non Operasional)'
      `);
      console.log('✓ pusatPelayanan column added successfully');
    } else {
      console.log('✓ pusatPelayanan column already exists');
    }
    
    console.log('All demografi fields have been added to users table');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addDemografiFieldsToUsers();


