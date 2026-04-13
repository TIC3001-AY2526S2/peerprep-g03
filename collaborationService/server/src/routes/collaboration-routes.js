import express from "express";
import { authenticateToken } from "../middleware/authenticate-token.js";
import {
  getOrCreateCollaborationSession,
  saveCollaborationAnswer,
  submitCollaborationAnswer,
  confirmCollaborationSubmission,
} from "../controllers/collaboration-controller.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/sessions/:matchId", getOrCreateCollaborationSession);
router.put("/sessions/:matchId", saveCollaborationAnswer);
router.post("/sessions/:matchId/submissions", submitCollaborationAnswer);
router.post("/sessions/:matchId/submissions/confirm", confirmCollaborationSubmission);

export default router;
