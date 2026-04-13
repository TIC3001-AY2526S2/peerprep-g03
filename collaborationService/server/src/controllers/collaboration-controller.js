/*
AI Assistance Disclosure:
Tool: ChatGPT 5.4, date: 2026-04-11 to 2026-04-13
Scope: Assisted with implementation refinement and debugs for collaboration-session persistence and answer submission flow. 
Author review: I reviewed, edited, tested, and verified the code. Requirements and architecture decisions were made by the team without AI.
*/
import QuestionAnswer from "../models/question-answer.js";
import CollaborationSession from "../models/collaboration-session.js";

const matchSessionLocks = new Map();

// Updates all the email to be trimmed and lowercased for consistent storage.
function normaliseEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

// Updates questionId to be trimmed for consistent storage.
function normaliseQuestionId(value) {
  return String(value ?? "").trim();
}

// Builds a consistent participant pair object with sorted emails to ensure uniqueness regardless of order.
function buildParticipantPair(currentUserEmail, peerEmail) {
  const emails = [normaliseEmail(currentUserEmail), normaliseEmail(peerEmail)].sort();
  return {
    collabUser1Email: emails[0],
    collabUser2Email: emails[1],
  };
}

// Finds the canonical collaboration session document for a given matchId. This is necessary because multiple sessions may be created for the same matchId due to the way sessions are created and updated. 
// The canonical session is determined by sorting by _id and taking the first document, which ensures consistency in which session is used for a matchId.
async function findCanonicalSessionByMatchId(matchId) {
  if (!matchId) {
    return null;
  }

  const sessions = await CollaborationSession.find({
    matchId,
  }).sort({ _id: 1 });

  if (sessions.length === 0) {
    return null;
  }

  return sessions[0];
}

// Ensures that operations for the same matchId are executed sequentially to prevent race conditions when creating or updating collaboration sessions. 
// Operations for different matchIds can proceed in parallel.
async function withMatchSessionLock(matchId, operation) {
  if (!matchId) {
    return operation();
  }

  const previous = matchSessionLocks.get(matchId) ?? Promise.resolve();
  let releaseLock;

  const current = new Promise((resolve) => {
    releaseLock = resolve;
  });

  matchSessionLocks.set(matchId, previous.then(() => current));

  await previous;

  try {
    return await operation();
  } finally {
    releaseLock();

    if (matchSessionLocks.get(matchId) === current) {
      matchSessionLocks.delete(matchId);
    }
  }
}

// Validates the request parameters and returns an error message if validation fails, or null if validation succeeds.
function validateSessionRequest({ questionId, peerEmail, currentUserEmail }) {
  if (!normaliseQuestionId(questionId)) {
    return "Question ID is required.";
  }

  if (!normaliseEmail(peerEmail)) {
    return "Peer email is required.";
  }

  if (!normaliseEmail(currentUserEmail)) {
    return "Authenticated user email is missing.";
  }

  if (normaliseEmail(peerEmail) === normaliseEmail(currentUserEmail)) {
    return "Peer email must be different from the current user email.";
  }

  return null;
}

// Builds a consistent response object for both collaboration sessions and question answers, with fields to indicate pending submissions and their status.
function buildSessionResponse(document, matchId) {
  return {
    id: document._id,
    matchId: matchId ?? document.matchId ?? null,
    questionId: document.questionId,
    collabUser1Email: document.collabUser1Email,
    collabUser2Email: document.collabUser2Email,
    answer: document.answer ?? "",
    isSubmission: false,
    submittedByEmail: null,
    pendingSubmission:
      document.pendingSubmissionRequestedByEmail
        ? {
            answer: document.pendingSubmissionAnswer ?? "",
            requestedByEmail: document.pendingSubmissionRequestedByEmail,
            requestedAt: document.pendingSubmissionRequestedAt,
          }
        : null,
    submissionDate: document.lastSavedAt ?? document.submissionDate ?? null,
  };
}

// Finds an existing collaboration session for the given matchId, questionId, and participant pair. 
// If no session exists, creates a new one. A previous draft from another match is not reused, so each new match starts with a blank editor.
// The operation is performed with a lock on the matchId to prevent race conditions when multiple requests for the same matchId are processed concurrently. 
async function findOrCreateSession({ matchId, questionId, currentUserEmail, peerEmail }) {
  return withMatchSessionLock(matchId, async () => {
    let session = null;

    if (matchId) {
      session = await findCanonicalSessionByMatchId(matchId);
    }

    if (!session) {
      session = await CollaborationSession.create({
        matchId: matchId ?? null,
        questionId: normaliseQuestionId(questionId),
        ...buildParticipantPair(currentUserEmail, peerEmail),
        answer: "",
        pendingSubmissionAnswer: "",
        pendingSubmissionRequestedByEmail: null,
        pendingSubmissionRequestedAt: null,
        lastSavedAt: new Date(),
      });
    } else if (!session.matchId && matchId) {
      session.matchId = matchId;
      await session.save();
    }

    if (matchId && session && session.matchId !== matchId) {
      session.matchId = matchId;
      await session.save();
    }

    return session;
  });
}

// Function to get or create a collaboration session for a given matchId, questionId, and participant pair.
export async function getOrCreateCollaborationSession(req, res) {
  try {
    const { matchId } = req.params;
    const { questionId, peerEmail } = req.query;
    const currentUserEmail = req.user?.email;

    const validationError = validateSessionRequest({
      questionId,
      peerEmail,
      currentUserEmail,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const session = await findOrCreateSession({
      matchId,
      questionId,
      currentUserEmail,
      peerEmail,
    });

    return res.status(200).json({
      message: "Collaboration session loaded.",
      data: buildSessionResponse(session, matchId),
    });
  } catch (error) {
    console.error("Failed to load collaboration session:", error);
    return res.status(500).json({ message: error.message || "Failed to load collaboration session." });
  }
}

// Function to save the current answer for a collaboration session without submitting it. 
// This allows users to save their progress without requesting submission approval.
export async function saveCollaborationAnswer(req, res) {
  try {
    const { matchId } = req.params;
    const { questionId, peerEmail, answer } = req.body;
    const currentUserEmail = req.user?.email;

    const validationError = validateSessionRequest({
      questionId,
      peerEmail,
      currentUserEmail,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const session = await findOrCreateSession({
      matchId,
      questionId,
      currentUserEmail,
      peerEmail,
    });

    session.answer = String(answer ?? "");
    session.lastSavedAt = new Date();

    if (matchId) {
      session.matchId = matchId;
    }

    await session.save();

    return res.status(200).json({
      message: "Collaboration answer saved.",
      data: buildSessionResponse(session, matchId),
    });
  } catch (error) {
    console.error("Failed to save collaboration answer:", error);
    return res.status(500).json({ message: error.message || "Failed to save collaboration answer." });
  }
}

// Function to request submission approval for a collaboration answer. 
// This sets the pending submission fields in the collaboration session, which can then be confirmed by the peer to create a question answer record.
export async function submitCollaborationAnswer(req, res) {
  try {
    const { matchId } = req.params;
    const { questionId, peerEmail, answer } = req.body;
    const currentUserEmail = req.user?.email;

    const validationError = validateSessionRequest({
      questionId,
      peerEmail,
      currentUserEmail,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const draftSession = await findOrCreateSession({
      matchId,
      questionId,
      currentUserEmail,
      peerEmail,
    });

    draftSession.pendingSubmissionAnswer = String(answer ?? "");
    draftSession.pendingSubmissionRequestedByEmail = normaliseEmail(currentUserEmail);
    draftSession.pendingSubmissionRequestedAt = new Date();
    draftSession.answer = String(answer ?? "");
    draftSession.lastSavedAt = draftSession.pendingSubmissionRequestedAt;
    await draftSession.save();

    return res.status(202).json({
      message: "Submission approval requested.",
      data: buildSessionResponse(draftSession, matchId),
    });
  } catch (error) {
    console.error("Failed to request collaboration submission:", error);
    return res.status(500).json({ message: error.message || "Failed to request collaboration submission." });
  }
}

// Function to confirm a pending collaboration submission. 
// This creates a question answer record and clears the pending submission fields in the collaboration session.
export async function confirmCollaborationSubmission(req, res) {
  try {
    const { matchId } = req.params;
    const { questionId, peerEmail } = req.body;
    const currentUserEmail = req.user?.email;

    const validationError = validateSessionRequest({
      questionId,
      peerEmail,
      currentUserEmail,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const draftSession = await findOrCreateSession({
      matchId,
      questionId,
      currentUserEmail,
      peerEmail,
    });

    if (!draftSession.pendingSubmissionRequestedByEmail) {
      return res.status(400).json({ message: "There is no pending submission to confirm." });
    }

    if (normaliseEmail(currentUserEmail) === draftSession.pendingSubmissionRequestedByEmail) {
      return res.status(400).json({ message: "The requesting user cannot confirm their own submission." });
    }

    const participantPair = buildParticipantPair(currentUserEmail, peerEmail);
    const submittedAt = new Date();

    const submission = await QuestionAnswer.create({
      matchId: matchId ?? null,
      questionId: normaliseQuestionId(draftSession.questionId),
      ...participantPair,
      answer: String(draftSession.pendingSubmissionAnswer ?? ""),
      submittedByEmail: draftSession.pendingSubmissionRequestedByEmail,
      submissionDate: submittedAt,
    });

    draftSession.answer = String(draftSession.pendingSubmissionAnswer ?? "");
    draftSession.pendingSubmissionAnswer = "";
    draftSession.pendingSubmissionRequestedByEmail = null;
    draftSession.pendingSubmissionRequestedAt = null;
    draftSession.lastSavedAt = submittedAt;
    await draftSession.save();

    return res.status(201).json({
      message: "Collaboration answer confirmed and submitted.",
      data: buildSessionResponse(submission, matchId),
    });
  } catch (error) {
    console.error("Failed to confirm collaboration submission:", error);
    return res.status(500).json({ message: error.message || "Failed to confirm collaboration submission." });
  }
}
