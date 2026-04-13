import express from "express";
import { requireOwnerOrAdmin } from "../middleware/basic-access-control.js";

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  updateUserPrivilege,
} from "../controller/user-controller.js";

import {
  ROLES,
  requireRole,
  authenticateToken
} from "@peerprep/auth"

const router = express.Router();

router.get("/", authenticateToken, requireRole(ROLES.ADMIN), getAllUsers);

router.patch("/:id/privilege", authenticateToken, requireRole(ROLES.ADMIN), updateUserPrivilege);

router.post("/", createUser);

router.get("/:id", authenticateToken, requireOwnerOrAdmin, getUser);

router.patch("/:id", authenticateToken, requireOwnerOrAdmin, updateUser);

router.delete("/:id", authenticateToken, requireOwnerOrAdmin, deleteUser);

export default router;
