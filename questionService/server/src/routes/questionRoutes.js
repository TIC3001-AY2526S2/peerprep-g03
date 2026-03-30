// route definitions
import express from "express";
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";

import {
  authenticateToken,
  requireRole,
  ROLES,
} from "@peerprep/auth";

const router = express.Router();

router.get("/", getAllQuestions);
router.post("/", authenticateToken, requireRole(ROLES.ADMIN), createQuestion);
router.put("/:id", authenticateToken, requireRole(ROLES.ADMIN), updateQuestion);
router.delete("/:id", authenticateToken, requireRole(ROLES.ADMIN), deleteQuestion);

export default router;