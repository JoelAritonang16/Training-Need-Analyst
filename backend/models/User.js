import { DataTypes } from "sequelize";

const User = (sequelize, Sequelize) => {
  const UserModel = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [3, 50],
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 255], // Minimum 6 characters
        },
      },
      role: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      divisiId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'divisi',
          key: 'id'
        },
        comment: 'Foreign key ke tabel divisi'
      },
      branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'branch',
          key: 'id'
        },
        comment: 'Foreign key ke tabel branch'
      },
      anakPerusahaanId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'anak_perusahaan',
          key: 'id'
        },
        comment: 'Foreign key ke tabel anak_perusahaan (untuk role admin)'
      },
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["username"],
          unique: true,
        },
      ],
    }
  );
  return UserModel;
};

export default User;
