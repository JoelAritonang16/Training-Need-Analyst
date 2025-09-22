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
