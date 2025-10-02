import { DataTypes } from "sequelize";

const TrainingProposalItem = (sequelize, Sequelize) => {
  const TrainingProposalItemModel = sequelize.define(
    "TrainingProposalItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      proposalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "training_proposals",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      Uraian: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      WaktuPelaksanan: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      JumlahPeserta: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      JumlahHariPesertaPelatihan: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      LevelTingkatan: {
        type: DataTypes.ENUM("STRUKTURAL", "NON STRUKTURAL"),
        allowNull: true,
      },
      Beban: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      BebanTransportasi: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      BebanAkomodasi: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      BebanUangSaku: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      TotalUsulan: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      tableName: "training_proposal_items",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return TrainingProposalItemModel;
};

export default TrainingProposalItem;
