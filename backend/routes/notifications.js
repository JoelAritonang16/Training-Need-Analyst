import express from "express";
import notificationController from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  auth.isAuthenticated,
  notificationController.getNotifications
);

router.get(
  "/unread/count",
  auth.isAuthenticated,
  notificationController.getUnreadCount
);

router.get(
  "/draft-tna/count",
  auth.isAuthenticated,
  notificationController.getDraftTNANotificationCount
);

router.patch(
  "/:id/read",
  auth.isAuthenticated,
  notificationController.markAsRead
);

router.patch(
  "/read/all",
  auth.isAuthenticated,
  notificationController.markAllAsRead
);

router.delete(
  "/:id",
  auth.isAuthenticated,
  notificationController.deleteNotification
);

export default router;

