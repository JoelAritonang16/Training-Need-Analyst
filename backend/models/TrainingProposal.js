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
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      trainingType: {
        type: DataTypes.ENUM('technical', 'soft_skill', 'leadership', 'compliance', 'other'),
        allowNull: false,
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
      },
      targetParticipants: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      estimatedDuration: {
        type: DataTypes.INTEGER, // in hours
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      proposedDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      budget: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      justification: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expectedOutcome: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'draft',
      },
      unit: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      proposerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      reviewerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      approverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      reviewNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approvalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reviewDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approvalDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "training_proposals",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["proposerId"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["unit"],
        },
        {
          fields: ["department"],
        },
        {
          fields: ["trainingType"],
        },
      ],
    }
  );

  return TrainingProposalModel;
};

export default TrainingProposal;
