'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'fullName', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Nama lengkap user'
    });

    await queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Email user'
    });

    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Nomor telepon user'
    });

    await queryInterface.addColumn('users', 'unit', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Unit/Divisi user'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'fullName');
    await queryInterface.removeColumn('users', 'email');
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'unit');
  }
};
