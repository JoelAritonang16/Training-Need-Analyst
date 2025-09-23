import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';

const AnakPerusahaanBranch = (sequelize, DataTypes) => {
  const AnakPerusahaanBranchModel = sequelize.define('AnakPerusahaanBranch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    anakPerusahaanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'anak_perusahaan',
        key: 'id'
      },
      comment: 'Foreign key ke tabel anak_perusahaan'
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'branch',
        key: 'id'
      },
      comment: 'Foreign key ke tabel branch'
    }
  }, {
    tableName: 'anak_perusahaan_branch',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['anakPerusahaanId', 'branchId'],
        name: 'unique_anak_perusahaan_branch'
      }
    ]
  });

  return AnakPerusahaanBranchModel;
};

export default AnakPerusahaanBranch;
