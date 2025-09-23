import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';

const AnakPerusahaan = (sequelize, DataTypes) => {
  const AnakPerusahaanModel = sequelize.define('AnakPerusahaan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nama anak perusahaan'
    }
  }, {
    tableName: 'anak_perusahaan',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return AnakPerusahaanModel;
};

export default AnakPerusahaan;
