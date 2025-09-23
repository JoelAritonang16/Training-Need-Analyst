import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';

const Divisi = (sequelize, DataTypes) => {
  const DivisiModel = sequelize.define('Divisi', {
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
    tableName: 'divisi',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return DivisiModel;
};

export default Divisi;
