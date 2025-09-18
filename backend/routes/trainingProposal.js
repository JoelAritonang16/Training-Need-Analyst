import express from "express";
import trainingProposalController from "../controllers/trainingProposalController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  auth.isAuthenticated,
  trainingProposalController.getAllProposals
);
router.post(
  "/",
  auth.isAuthenticated,
  trainingProposalController.createProposal
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
export default router;
