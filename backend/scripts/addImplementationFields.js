import db from '../models/index.js';

const addImplementationFields = async () => {
  try {
    console.log('Menambahkan field implementasiStatus, isRevision, dan originalProposalId ke tabel training_proposals...');
    
    const sequelize = db.sequelize;
    const queryInterface = sequelize.getQueryInterface();
    
    // Cek apakah field sudah ada
    const tableDescription = await queryInterface.describeTable('training_proposals');
    
    // Tambah field implementasiStatus jika belum ada
    if (!tableDescription.implementasiStatus) {
      await queryInterface.addColumn('training_proposals', 'implementasiStatus', {
        type: db.Sequelize.DataTypes.ENUM('BELUM_IMPLEMENTASI', 'SUDAH_IMPLEMENTASI'),
        allowNull: true,
        defaultValue: null,
        comment: 'Status implementasi proposal (hanya untuk proposal yang sudah disetujui)'
      });
      console.log('✅ Field implementasiStatus berhasil ditambahkan');
    } else {
      console.log('ℹ️  Field implementasiStatus sudah ada');
    }
    
    // Tambah field isRevision jika belum ada
    if (!tableDescription.isRevision) {
      await queryInterface.addColumn('training_proposals', 'isRevision', {
        type: db.Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Flag untuk menandai proposal ini adalah revisi dari proposal yang ditolak sebelumnya'
      });
      console.log('✅ Field isRevision berhasil ditambahkan');
    } else {
      console.log('ℹ️  Field isRevision sudah ada');
    }
    
    // Tambah field originalProposalId jika belum ada
    if (!tableDescription.originalProposalId) {
      await queryInterface.addColumn('training_proposals', 'originalProposalId', {
        type: db.Sequelize.DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'training_proposals',
          key: 'id'
        },
        comment: 'ID proposal asli jika ini adalah revisi (untuk tracking)'
      });
      console.log('✅ Field originalProposalId berhasil ditambahkan');
    } else {
      console.log('ℹ️  Field originalProposalId sudah ada');
    }
    
    console.log('✅ Semua field berhasil ditambahkan atau sudah ada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error menambahkan field:', error);
    process.exit(1);
  }
};

// Jalankan script
addImplementationFields();

