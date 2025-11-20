import { Notification, TrainingProposal, User } from "../models/index.js";

const notificationController = {
  // Get all notifications for current user
  async getNotifications(req, res) {
    try {
      const { id: userId } = req.user;

      const notifications = await Notification.findAll({
        where: { userId },
        include: [
          {
            model: TrainingProposal,
            as: 'proposal',
            attributes: ['id', 'Uraian', 'status'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'fullName']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        notifications: notifications
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat notifikasi",
      });
    }
  },

  // Get unread notifications count
  async getUnreadCount(req, res) {
    try {
      const { id: userId } = req.user;

      const count = await Notification.count({
        where: {
          userId,
          isRead: false
        }
      });

      res.json({
        success: true,
        count: count
      });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat jumlah notifikasi",
      });
    }
  },

  // Get draft TNA notification count
  async getDraftTNANotificationCount(req, res) {
    try {
      const { id: userId, role } = req.user;

      // Only admin and superadmin can see draft TNA notifications
      if (role !== 'admin' && role !== 'superadmin') {
        return res.json({
          success: true,
          count: 0
        });
      }

      const count = await Notification.count({
        where: {
          userId,
          type: 'DRAFT_TNA_SUBMITTED',
          isRead: false
        }
      });

      res.json({
        success: true,
        count: count
      });
    } catch (error) {
      console.error("Get draft TNA notification count error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat jumlah notifikasi draft TNA",
      });
    }
  },

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { id: userId } = req.user;
      const notificationId = req.params.id;

      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          userId: userId
        }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notifikasi tidak ditemukan",
        });
      }

      await notification.update({
        isRead: true,
        readAt: new Date()
      });

      res.json({
        success: true,
        message: "Notifikasi ditandai sebagai sudah dibaca",
        notification: notification
      });
    } catch (error) {
      console.error("Mark as read error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menandai notifikasi",
      });
    }
  },

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const { id: userId } = req.user;

      await Notification.update(
        {
          isRead: true,
          readAt: new Date()
        },
        {
          where: {
            userId,
            isRead: false
          }
        }
      );

      res.json({
        success: true,
        message: "Semua notifikasi ditandai sebagai sudah dibaca"
      });
    } catch (error) {
      console.error("Mark all as read error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menandai semua notifikasi",
      });
    }
  },

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id: userId } = req.user;
      const notificationId = req.params.id;

      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          userId: userId
        }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notifikasi tidak ditemukan",
        });
      }

      await notification.destroy();

      res.json({
        success: true,
        message: "Notifikasi berhasil dihapus"
      });
    } catch (error) {
      console.error("Delete notification error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus notifikasi",
      });
    }
  }
};

export default notificationController;

