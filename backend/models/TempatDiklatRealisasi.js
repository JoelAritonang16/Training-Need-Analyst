import { DataTypes } from "sequelize";

const TempatDiklatRealisasi = (sequelize, Sequelize) => {
  const TempatDiklatRealisasiModel = sequelize.define(
    "TempatDiklatRealisasi",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      branchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'branch',
          key: 'id'
        },
        comment: 'Branch ID untuk tempat diklat'
      },
      namaTempat: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nama tempat diklat'
      },
      alamat: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bulan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 12
        },
        comment: 'Bulan realisasi (1-12)'
      },
      tahun: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2026,
        comment: 'Tahun realisasi'
      },
      jumlahKegiatan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Jumlah kegiatan diklat yang dilakukan'
      },
      totalPeserta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total peserta diklat'
      },
      totalBiaya: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total biaya realisasi'
      },
      keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
    },
    {
      tableName: "tempat_diklat_realisasi",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return TempatDiklatRealisasiModel;
};

export default TempatDiklatRealisasi;

