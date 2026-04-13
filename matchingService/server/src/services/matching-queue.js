/*
AI Assistance Disclosure:
Tool: ChatGPT 5.4
Date: 2026-04-09 to 2026-04-13
Scope: Assisted with implementation refinement and debugging for the in-memory matching queue and timeout handling.
Author review: I reviewed, edited, tested, and verified the final code. Requirements and architecture decisions were made by the team without AI.
*/
import crypto from "node:crypto";

const MATCH_WAIT_MS = 30_000;

const waitingQueue = [];
const tickets = new Map();
const activeTicketByUserId = new Map();
const recentLogs = [];

// Returns the current queue state for the frontend.
function snapshotQueue() {
  return waitingQueue.map((ticket) => ({
    ticketId: ticket.ticketId,
    userId: ticket.user.id,
    topic: ticket.criteria.topic,
    difficulty: ticket.criteria.difficulty,
    status: ticket.status,
  }));
}

// Stores queue events for the debug panel.
function writeLog(event, detail = {}) {
  recentLogs.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    event,
    queue: snapshotQueue(),
    detail,
  });

  if (recentLogs.length > 20) {
    recentLogs.length = 20;
  }
}

// Clears the timer for a ticket.
function clearTicketTimer(ticket) {
  if (ticket.timeoutHandle) {
    clearTimeout(ticket.timeoutHandle);
    ticket.timeoutHandle = null;
  }
}

// Returns the ticket data used by the frontend.
function buildStatus(ticket) {
  const now = Date.now();
  const remainingMs =
    ticket.status === "waiting"
      ? Math.max(ticket.expiresAt - now, 0)
      : Math.max(ticket.remainingMs ?? 0, 0);

  return {
    ticketId: ticket.ticketId,
    status: ticket.status,
    criteria: ticket.criteria,
    matchContext: ticket.matchContext ?? null,
    requestedAt: ticket.requestedAt,
    expiresAt: ticket.expiresAt,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    matchId: ticket.matchId ?? null,
    message: ticket.message ?? null,
    self: {
      id: ticket.user.id,
      username: ticket.user.username,
      email: ticket.user.email,
    },
    peer: ticket.peer
      ? {
          id: ticket.peer.id,
          username: ticket.peer.username,
          email: ticket.peer.email,
        }
      : null,
  };
}

// Removes a ticket from the queue.
function removeWaitingTicket(ticketId) {
  const index = waitingQueue.findIndex((ticket) => ticket.ticketId === ticketId);
  if (index >= 0) {
    waitingQueue.splice(index, 1);
  }
}

// Finalises a waiting ticket.
function finalizeWaitingTicket(ticket, status, message) {
  if (!ticket || ticket.status !== "waiting") {
    return;
  }

  clearTicketTimer(ticket);
  removeWaitingTicket(ticket.ticketId);
  activeTicketByUserId.delete(ticket.user.id);
  ticket.status = status;
  ticket.message = message;
  ticket.remainingMs = Math.max(ticket.expiresAt - Date.now(), 0);
}

function chooseCandidate(userId, criteria) {
  const exactMatchIndex = waitingQueue.findIndex(
    (ticket) =>
      ticket.user.id !== userId &&
      ticket.criteria.topic === criteria.topic &&
      ticket.criteria.difficulty === criteria.difficulty,
  );

  if (exactMatchIndex >= 0) {
    return {
      index: exactMatchIndex,
      matchContext: {
        topic: criteria.topic,
        difficulty: criteria.difficulty,
        strategy: "topic-and-difficulty",
      },
    };
  }

  const topicOnlyIndex = waitingQueue.findIndex(
    (ticket) =>
      ticket.user.id !== userId && ticket.criteria.topic === criteria.topic,
  );

  if (topicOnlyIndex >= 0) {
    return {
      index: topicOnlyIndex,
      matchContext: {
        topic: criteria.topic,
        difficulty: null,
        strategy: "topic-only",
      },
    };
  }

  return {
    index: -1,
    matchContext: null,
  };
}

// Returns the matched peer details.
function createPeerView(ticket) {
  return {
    id: ticket.user.id,
    username: ticket.user.username,
    email: ticket.user.email,
  };
}

// Adds a user to the queue or matches immediately.
export function enqueueMatchRequest({ user, criteria }) {
  const existingTicketId = activeTicketByUserId.get(user.id);
  if (existingTicketId) {
    const existingTicket = tickets.get(existingTicketId);
    if (existingTicket && existingTicket.status === "waiting") {
      return buildStatus(existingTicket);
    }
  }

  const ticketId = crypto.randomUUID();
  const requestedAt = new Date().toISOString();
  const expiresAt = Date.now() + MATCH_WAIT_MS;

  const ticket = {
    ticketId,
    user,
    criteria,
    status: "waiting",
    requestedAt,
    expiresAt,
    timeoutHandle: null,
    message: "Searching for a peer...",
    peer: null,
    matchId: null,
    matchContext: null,
    remainingMs: MATCH_WAIT_MS,
  };

  const queueBefore = snapshotQueue();
  const candidate = chooseCandidate(user.id, criteria);

  tickets.set(ticketId, ticket);
  activeTicketByUserId.set(user.id, ticketId);

  if (candidate.index >= 0) {
    const matchedTicket = waitingQueue[candidate.index];

    finalizeWaitingTicket(matchedTicket, "matched", "Peer matched successfully.");
    finalizeWaitingTicket(ticket, "matched", "Peer matched successfully.");

    const matchId = crypto.randomUUID();
    matchedTicket.matchId = matchId;
    ticket.matchId = matchId;
    matchedTicket.matchContext = candidate.matchContext;
    ticket.matchContext = candidate.matchContext;
    matchedTicket.peer = createPeerView(ticket);
    ticket.peer = createPeerView(matchedTicket);
    matchedTicket.remainingMs = 0;
    ticket.remainingMs = 0;

    writeLog("MATCH_FOUND", {
      queueBefore,
      queueAfter: snapshotQueue(),
      matchId,
      users: [matchedTicket.user.id, ticket.user.id],
      criteria,
      matchContext: candidate.matchContext,
    });

    return buildStatus(ticket);
  }

  waitingQueue.push(ticket);

  ticket.timeoutHandle = setTimeout(() => {
    const currentTicket = tickets.get(ticketId);
    if (!currentTicket || currentTicket.status !== "waiting") {
      return;
    }

    finalizeWaitingTicket(currentTicket, "timeout", "No match found within 30 seconds.");
    writeLog("MATCH_TIMEOUT", {
      ticketId,
      userId: currentTicket.user.id,
      criteria: currentTicket.criteria,
    });
  }, MATCH_WAIT_MS);

  writeLog("QUEUE_JOIN", {
    queueBefore,
    queueAfter: snapshotQueue(),
    ticketId,
    userId: user.id,
    criteria,
  });

  return buildStatus(ticket);
}

// Returns the current ticket status.
export function getTicketStatus(ticketId, requesterId) {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return null;
  }

  if (ticket.user.id !== requesterId) {
    return false;
  }

  return buildStatus(ticket);
}

// Cancels a waiting ticket.
export function cancelTicket(ticketId, requesterId) {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return null;
  }

  if (ticket.user.id !== requesterId) {
    return false;
  }

  if (ticket.status !== "waiting") {
    return buildStatus(ticket);
  }

  const queueBefore = snapshotQueue();
  finalizeWaitingTicket(ticket, "cancelled", "Matching attempt cancelled.");

  writeLog("QUEUE_CANCEL", {
    queueBefore,
    queueAfter: snapshotQueue(),
    ticketId,
    userId: requesterId,
  });

  return buildStatus(ticket);
}

// Returns queue snapshot and recent logs.
export function getDebugState() {
  return {
    waitingCount: waitingQueue.length,
    queue: snapshotQueue(),
    logs: recentLogs,
  };
}
