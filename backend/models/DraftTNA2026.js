import { DataTypes } from "sequelize";

const DraftTNA2026 = (sequelize, Sequelize) => {
  const DraftTNA2026Model = sequelize.define(
    "DraftTNA2026",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      tahun: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2026,
        comment: 'Tahun TNA 2026'
      },
      branchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'branch',
          key: 'id'
        },
        comment: 'Branch ID untuk draft usulan'
      },
      divisiId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'divisi',
          key: 'id'
        },
        comment: 'Divisi ID (untuk korporat)'
      },
      uraian: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      waktuPelaksanaan: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      jumlahPeserta: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jumlahHari: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      levelTingkatan: {
        type: DataTypes.ENUM("STRUKTURAL", "NON STRUKTURAL"),
        allowNull: false,
      },
      beban: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      bebanTransportasi: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      bebanAkomodasi: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      bebanUangSaku: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      totalUsulan: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED'),
        allowNull: false,
        defaultValue: 'DRAFT'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
    },
    {
      tableName: "draft_tna_2026",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return DraftTNA2026Model;
};

export default DraftTNA2026;

