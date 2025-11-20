import { DataTypes } from "sequelize";

const Notification = (sequelize, Sequelize) => {
  const NotificationModel = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User yang menerima notifikasi'
      },
      proposalId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'training_proposals',
          key: 'id'
        },
        comment: 'Proposal terkait notifikasi'
      },
      draftTNAId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'draft_tna_2026',
          key: 'id'
        },
        comment: 'Draft TNA terkait notifikasi'
      },
      type: {
        type: DataTypes.ENUM('APPROVE_ADMIN', 'APPROVE_SUPERADMIN', 'REJECT_SUPERADMIN', 'PROPOSAL_SUBMITTED', 'DRAFT_TNA_SUBMITTED'),
        allowNull: false,
        comment: 'Tipe notifikasi'
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Judul notifikasi'
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Pesan notifikasi'
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Status sudah dibaca atau belum'
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Waktu notifikasi dibaca'
      }
    },
    {
      tableName: "notifications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return NotificationModel;
};

export default Notification;

