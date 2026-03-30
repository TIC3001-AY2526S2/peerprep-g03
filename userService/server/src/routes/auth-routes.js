import express from "express";

import { handleLogin, handleVerifyToken } from "../controller/auth-controller.js";
import { authenticateToken } from "@peerprep/auth";

const router = express.Router();

router.post("/login", handleLogin);

router.get("/verify-token", authenticateToken, handleVerifyToken);

export default router;
