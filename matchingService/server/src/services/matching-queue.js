import crypto from "node:crypto";

const MATCH_WAIT_MS = 30_000;

const waitingQueue = [];
const tickets = new Map();
const activeTicketByUserId = new Map();
const recentLogs = [];

function snapshotQueue() {
  return waitingQueue.map((ticket) => ({
    ticketId: ticket.ticketId,
    userId: ticket.user.id,
    topic: ticket.criteria.topic,
    difficulty: ticket.criteria.difficulty,
    status: ticket.status,
  }));
}

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

function clearTicketTimer(ticket) {
  if (ticket.timeoutHandle) {
    clearTimeout(ticket.timeoutHandle);
    ticket.timeoutHandle = null;
  }
}

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

function removeWaitingTicket(ticketId) {
  const index = waitingQueue.findIndex((ticket) => ticket.ticketId === ticketId);
  if (index >= 0) {
    waitingQueue.splice(index, 1);
  }
}

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

function chooseCandidateIndex(userId, criteria) {
  const exactMatchIndex = waitingQueue.findIndex(
    (ticket) =>
      ticket.user.id !== userId &&
      ticket.criteria.topic === criteria.topic &&
      ticket.criteria.difficulty === criteria.difficulty,
  );

  if (exactMatchIndex >= 0) {
    return exactMatchIndex;
  }

  return waitingQueue.findIndex(
    (ticket) =>
      ticket.user.id !== userId && ticket.criteria.topic === criteria.topic,
  );
}

function createPeerView(ticket) {
  return {
    id: ticket.user.id,
    username: ticket.user.username,
    email: ticket.user.email,
  };
}

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
    remainingMs: MATCH_WAIT_MS,
  };

  const queueBefore = snapshotQueue();
  const candidateIndex = chooseCandidateIndex(user.id, criteria);

  tickets.set(ticketId, ticket);
  activeTicketByUserId.set(user.id, ticketId);

  if (candidateIndex >= 0) {
    const matchedTicket = waitingQueue[candidateIndex];

    finalizeWaitingTicket(matchedTicket, "matched", "Peer matched successfully.");
    finalizeWaitingTicket(ticket, "matched", "Peer matched successfully.");

    const matchId = crypto.randomUUID();
    matchedTicket.matchId = matchId;
    ticket.matchId = matchId;
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

export function getDebugState() {
  return {
    waitingCount: waitingQueue.length,
    queue: snapshotQueue(),
    logs: recentLogs,
  };
}
