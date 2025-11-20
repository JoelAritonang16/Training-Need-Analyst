import { DataTypes } from "sequelize";

const TrainingProposal = (sequelize, Sequelize) => {
  const TrainingProposalModel = sequelize.define(
    "TrainingProposal",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Uraian: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      WaktuPelaksanan: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      JumlahPeserta: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      JumlahHariPesertaPelatihan: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      LevelTingkatan: {
        type: DataTypes.ENUM("STRUKTURAL", "NON STRUKTURAL"), // in hours
        allowNull: false,
      },
      Beban: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      BebanTransportasi: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      BebanAkomodasi: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      BebanUangSaku: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      TotalUsulan: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'branch',
          key: 'id'
        },
        comment: 'Branch ID dari user yang membuat proposal (auto-assigned)'
      },
      status: {
        type: DataTypes.ENUM('MENUNGGU', 'APPROVE_ADMIN', 'APPROVE_SUPERADMIN', 'DITOLAK'),
        allowNull: false,
        defaultValue: 'MENUNGGU'
      },
      alasan: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Alasan penolakan dari admin atau superadmin'
      },
      implementasiStatus: {
        type: DataTypes.ENUM('BELUM_IMPLEMENTASI', 'SUDAH_IMPLEMENTASI'),
        allowNull: true,
        defaultValue: null,
        comment: 'Status implementasi proposal (hanya untuk proposal yang sudah disetujui)'
      },
      isRevision: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Flag untuk menandai proposal ini adalah revisi dari proposal yang ditolak sebelumnya'
      },
      originalProposalId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'training_proposals',
          key: 'id'
        },
        comment: 'ID proposal asli jika ini adalah revisi (untuk tracking)'
      },
    },
    {
      tableName: "training_proposals",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return TrainingProposalModel;
};

export default TrainingProposal;
