import express from "express";
import { authenticateToken } from "@peerprep/auth";
import {
  cancelMatchTicket,
  createMatchTicket,
  getMatchTicketStatus,
  getQueueDebugState,
} from "../controllers/matching-controller.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/debug", getQueueDebugState);
router.post("/tickets", createMatchTicket);
router.get("/tickets/:ticketId", getMatchTicketStatus);
router.delete("/tickets/:ticketId", cancelMatchTicket);

export default router;
