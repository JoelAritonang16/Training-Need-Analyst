import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';

const Branch = (sequelize, DataTypes) => {
  const BranchModel = sequelize.define('Branch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }
  }, {
    tableName: 'branch',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return BranchModel;
};

export default Branch;
