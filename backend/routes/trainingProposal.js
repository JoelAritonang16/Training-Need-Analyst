import express from "express";
import trainingProposalController from "../controllers/trainingProposalController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  auth.isAuthenticated,
  trainingProposalController.getAllProposals
);
router.get(
  "/export",
  auth.isAuthenticated,
  trainingProposalController.exportProposals
);
router.get(
  "/export.xlsx",
  auth.isAuthenticated,
  trainingProposalController.exportProposalsXlsx
);
router.post(
  "/",
  auth.isAuthenticated,
  trainingProposalController.createProposal
);
router.get(
  "/:id/export",
  auth.isAuthenticated,
  trainingProposalController.exportProposalById
);
router.get(
  "/:id/export.xlsx",
  auth.isAuthenticated,
  trainingProposalController.exportProposalByIdXlsx
);
router.put(
  "/:id",
  auth.isAuthenticated,
  trainingProposalController.updateProposal
);
router.delete(
  "/:id",
  auth.isAuthenticated,
  trainingProposalController.deleteProposal
);
router.get(
  "/:id",
  auth.isAuthenticated,
  trainingProposalController.getProposalById
);
router.patch(
  "/:id/status",
  auth.isAuthenticated,
  trainingProposalController.updateProposalStatus
);
router.patch(
  "/:id/implementation-status",
  auth.isAuthenticated,
  trainingProposalController.updateImplementationStatus
);
export default router;
