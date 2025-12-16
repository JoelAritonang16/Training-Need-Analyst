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
      fullName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Nama lengkap user'
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          isEmail: true
        },
        comment: 'Email user'
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Nomor telepon user'
      },
      unit: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Unit/Divisi user'
      },
      profilePhoto: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Path/URL foto profil user'
      },
      jenisKelamin: {
        type: DataTypes.ENUM('Laki-laki', 'Perempuan'),
        allowNull: true,
        comment: 'Jenis kelamin user'
      },
      pendidikan: {
        type: DataTypes.ENUM('SMA', 'Diploma', 'S1', 'S2', 'S3'),
        allowNull: true,
        comment: 'Tingkat pendidikan user'
      },
      jenisPekerja: {
        type: DataTypes.ENUM('Organik', 'Non Organik'),
        allowNull: true,
        comment: 'Jenis pekerja (Organik/Non Organik)'
      },
      pusatPelayanan: {
        type: DataTypes.ENUM('Operasional', 'Non Operasional'),
        allowNull: true,
        comment: 'Pusat pelayanan (Operasional/Non Operasional)'
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
