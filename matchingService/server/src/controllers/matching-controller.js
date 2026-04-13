/*
AI Assistance Disclosure:
Tool: ChatGPT 5.4
Date: 2026-04-09 to 2026-04-13
Scope: Assisted with implementation refinement and debugging for matching request handling and queue status endpoints.
Author review: I reviewed, edited, tested, and verified the final code. Requirements and architecture decisions were made by the team without AI.
*/
import { getUserProfile } from "../services/user-service.js";
import {
  cancelTicket,
  enqueueMatchRequest,
  getDebugState,
  getTicketStatus,
} from "../services/matching-queue.js";

// Validates topic and difficulty.
function validateCriteria(body) {
  const topic = String(body?.topic ?? "").trim();
  const difficulty = String(body?.difficulty ?? "").trim();
  const allowedDifficulty = ["Easy", "Medium", "Hard"];

  if (!topic) {
    return { error: "topic is required" };
  }

  if (!allowedDifficulty.includes(difficulty)) {
    return { error: `difficulty must be one of ${allowedDifficulty.join(", ")}` };
  }

  return { topic, difficulty };
}

// Creates a matching ticket.
export async function createMatchTicket(req, res) {
  const criteria = validateCriteria(req.body);
  if (criteria.error) {
    return res.status(400).json({ message: criteria.error });
  }

  try {
    const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
    const user = await getUserProfile(req.user.id, accessToken);

    const ticket = enqueueMatchRequest({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      criteria: {
        topic: criteria.topic,
        difficulty: criteria.difficulty,
      },
    });

    return res.status(200).json({
      message: ticket.status === "matched" ? "Peer matched successfully." : "Added to matching queue.",
      data: ticket,
    });
  } catch (error) {
    console.error("Failed to create match ticket:", error);
    return res.status(error.status === 404 ? 404 : 502).json({
      message: "Unable to validate user with user service.",
    });
  }
}

// Returns the current ticket status.
export function getMatchTicketStatus(req, res) {
  const ticket = getTicketStatus(req.params.ticketId, req.user.id);

  if (ticket === null) {
    return res.status(404).json({ message: "Match ticket not found." });
  }

  if (ticket === false) {
    return res.status(403).json({ message: "You cannot access this match ticket." });
  }

  return res.status(200).json({ message: "Match ticket loaded.", data: ticket });
}

// Cancels the current ticket.
export function cancelMatchTicket(req, res) {
  const ticket = cancelTicket(req.params.ticketId, req.user.id);

  if (ticket === null) {
    return res.status(404).json({ message: "Match ticket not found." });
  }

  if (ticket === false) {
    return res.status(403).json({ message: "You cannot cancel this match ticket." });
  }

  return res.status(200).json({ message: ticket.message, data: ticket });
}

// Returns queue snapshot and logs.
export function getQueueDebugState(req, res) {
  return res.status(200).json({
    message: "Queue debug state loaded.",
    data: getDebugState(),
  });
}
