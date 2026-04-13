/*
AI Assistance Disclosure:
Tool: ChatGPT 5.4, date: 2026-04-11 to 2026-04-13
Scope: Assisted with implementation refinement for the synchronized editor page, polling flow, and peer-confirmation flow. 
Author review: I reviewed, edited, tested, and verified the final code. Requirements and architecture decisions were made by the team without AI.
*/
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  confirmCollaborationSubmission,
  getCollaborationSession,
  saveCollaborationAnswer,
  submitCollaborationAnswer,
} from "../api/collaborationService";
import { getAllQuestions } from "../api/questionService";
import "../styles/Collaboration.css";

const POLL_INTERVAL_MS = 1500;
const AUTOSAVE_DELAY_MS = 600;

function formatTimestamp(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-SG");
}

function getQuestionIdentity(question) {
  if (!question) return "";
  return String(question.questionID ?? question._id ?? "").trim();
}

function formatQuestionTopic(question) {
  if (!question) {
    return "-";
  }

  const categories = Array.isArray(question.category)
    ? question.category
    : [question.category];
  const normalizedCategories = categories
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean);

  return normalizedCategories.length ? normalizedCategories.join(", ") : "-";
}

export default function Collaboration({ setAuth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { matchId } = useParams();

  const searchParams = new URLSearchParams(location.search);
  const routeQuestion = location.state?.question ?? null;
  const questionId = String(
    routeQuestion?.questionID ?? searchParams.get("questionId") ?? "",
  ).trim();
  const peerEmail = String(location.state?.peerEmail ?? searchParams.get("peerEmail") ?? "").trim();
  const peerUsername = location.state?.peerUsername ?? "Matched Peer";
  const currentUser = JSON.parse(localStorage.getItem("user") ?? "{}");

  const [question, setQuestion] = useState(routeQuestion);
  const [session, setSession] = useState(null);
  const [resolvedQuestionId, setResolvedQuestionId] = useState(questionId);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);
  const [isConfirmingSubmission, setIsConfirmingSubmission] = useState(false);
  const [statusText, setStatusText] = useState("Connecting to collaboration session...");
  const [statusType, setStatusType] = useState("info");
  const [loadError, setLoadError] = useState("");

  const displayTopic = formatQuestionTopic(question);
  const displayDifficulty = String(question?.complexity ?? "").trim() || "-";
  const currentUserEmail = String(currentUser.email ?? "").trim().toLowerCase();
  const isPendingRequester =
    session?.pendingSubmission?.requestedByEmail &&
    session.pendingSubmission.requestedByEmail === currentUserEmail;
  const canConfirmPendingSubmission =
    session?.pendingSubmission?.requestedByEmail &&
    session.pendingSubmission.requestedByEmail !== currentUserEmail;

  const pollRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const applyRemoteSessionRef = useRef(null);
  const codeRef = useRef("");
  const pendingLocalChangesRef = useRef(false);
  const lastSubmissionDateRef = useRef(null);
  const lastPendingRequesterRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    setAuth(false);
    navigate("/login");
  };

  const applyRemoteSession = (nextSession, options = {}) => {
    const remoteAnswer = String(nextSession?.answer ?? "");
    const remoteSubmissionDate = nextSession?.submissionDate ?? null;
    const remoteChanged = remoteSubmissionDate !== lastSubmissionDateRef.current;
    const nextPendingRequester = nextSession?.pendingSubmission?.requestedByEmail ?? null;
    const currentPendingRequester = lastPendingRequesterRef.current;

    setSession(nextSession);

    if (
      currentPendingRequester &&
      !nextPendingRequester &&
      currentPendingRequester === currentUserEmail
    ) {
      setStatusType("success");
      setStatusText("Your submission was confirmed. Returning to question list...");
      window.setTimeout(() => {
        navigate("/questions");
      }, 600);
    }

    lastPendingRequesterRef.current = nextPendingRequester;

    if (!options.force && !remoteChanged) {
      return;
    }

    if (!options.force && pendingLocalChangesRef.current && remoteAnswer !== codeRef.current) {
      return;
    }

    lastSubmissionDateRef.current = remoteSubmissionDate;

    if (remoteAnswer !== codeRef.current || options.force) {
      codeRef.current = remoteAnswer;
      setCode(remoteAnswer);
    }
  };

  applyRemoteSessionRef.current = applyRemoteSession;

  const persistAnswer = async (value) => {
    if (!matchId || !resolvedQuestionId || !peerEmail) {
      return;
    }

    setIsSaving(true);
    setStatusType("info");
    setStatusText("Saving shared editor changes...");

    try {
      const response = await saveCollaborationAnswer(matchId, {
        questionId: resolvedQuestionId,
        peerEmail,
        answer: value,
      });

      pendingLocalChangesRef.current = false;
      lastSubmissionDateRef.current = response.data.submissionDate ?? null;
      setSession(response.data);
      setResolvedQuestionId(String(response.data.questionId ?? resolvedQuestionId));
      setStatusType("success");
      setStatusText(`All changes synced at ${formatTimestamp(response.data.submissionDate)}`);
    } catch (error) {
      setStatusType("error");
      setStatusText(error.message || "Failed to save collaboration changes.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    if (!resolvedQuestionId) {
      return;
    }

    let isActive = true;

    const loadQuestionDetails = async () => {
      try {
        if (
          routeQuestion &&
          getQuestionIdentity(routeQuestion) === resolvedQuestionId
        ) {
          setQuestion(routeQuestion);
          return;
        }

        const questions = await getAllQuestions();
        const matchedQuestion = questions.find(
          (entry) => getQuestionIdentity(entry) === resolvedQuestionId,
        );

        if (isActive && matchedQuestion) {
          setQuestion(matchedQuestion);
        }
      } catch (error) {
        console.error("Failed to load question details:", error);
      }
    };

    loadQuestionDetails();

    return () => {
      isActive = false;
    };
  }, [resolvedQuestionId, routeQuestion]);

  useEffect(() => {
    if (!matchId || !resolvedQuestionId || !peerEmail) {
      setIsLoading(false);
      setLoadError("Match ID, question ID, or peer email is missing. Start from the matching page.");
      setStatusType("error");
      setStatusText("Missing collaboration details.");
      return undefined;
    }

    const loadSession = async ({ silent = false, force = false } = {}) => {
      try {
        const response = await getCollaborationSession(matchId, { questionId, peerEmail });
        applyRemoteSessionRef.current?.(response.data, { force });
        setResolvedQuestionId(String(response.data.questionId ?? resolvedQuestionId));
        setLoadError("");
        setStatusType("success");

        if (!silent) {
          setStatusText(
            response.data.submissionDate
              ? `Session ready. Last synced at ${formatTimestamp(response.data.submissionDate)}`
              : "Session ready.",
          );
        }
      } catch (error) {
        setLoadError(error.message || "Failed to load collaboration session.");
        setStatusType("error");
        setStatusText("Unable to connect to collaboration service.");
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    };

    loadSession({ force: true });

    pollRef.current = setInterval(() => {
      loadSession({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [matchId, peerEmail, questionId, resolvedQuestionId]);

  const handleCodeChange = (event) => {
    const nextValue = event.target.value;
    setCode(nextValue);
    codeRef.current = nextValue;
    pendingLocalChangesRef.current = true;
    setStatusType("info");
    setStatusText("Typing... changes will sync automatically.");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      persistAnswer(nextValue);
    }, AUTOSAVE_DELAY_MS);
  };

  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    pendingLocalChangesRef.current = true;
    await persistAnswer(codeRef.current);
  };

  const handleSubmitEntry = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setIsSubmittingEntry(true);
    pendingLocalChangesRef.current = true;
    setStatusType("info");
    setStatusText("Submitting entry...");

    try {
      const response = await submitCollaborationAnswer(matchId, {
        questionId: resolvedQuestionId,
        peerEmail,
        answer: codeRef.current,
      });
      lastSubmissionDateRef.current = response.data.submissionDate ?? null;
      setSession(response.data);
      setStatusType("success");
      setStatusText("Submission request sent. Waiting for your peer to confirm.");
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  const handleConfirmSubmission = async () => {
    setIsConfirmingSubmission(true);
    setStatusType("info");
    setStatusText("Confirming submission...");

    try {
      const response = await confirmCollaborationSubmission(matchId, {
        questionId: resolvedQuestionId,
        peerEmail,
      });
      lastSubmissionDateRef.current = response.data.submissionDate ?? null;
      setStatusType("success");
      setStatusText(`Entry confirmed at ${formatTimestamp(response.data.submissionDate)}`);
      navigate("/questions");
    } finally {
      setIsConfirmingSubmission(false);
    }
  };

  return (
    <div className="collaboration-page">
      <div className="page-header">
        <div>
          <h1>Shared Collaboration Room</h1>
          <p>Work on the matched question together in one synchronized editor.</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate("/matching")}>
            Matching
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/questions")}>
            Questions
          </button>
          <button className="btn btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className={`status-message ${statusType}`}>{statusText}</div>
      {loadError ? <div className="status-message error">{loadError}</div> : null}
      {isPendingRequester ? (
        <div className="status-message info">
          Submission pending peer confirmation since {formatTimestamp(session?.pendingSubmission?.requestedAt)}.
        </div>
      ) : null}
      {canConfirmPendingSubmission ? (
        <div className="collaboration-confirm-card">
          <h2>Pending Submission</h2>
          <p>
            {session.pendingSubmission.requestedByEmail} requested to submit this shared answer on{" "}
            {formatTimestamp(session.pendingSubmission.requestedAt)}.
          </p>
          <div className="collaboration-actions">
            <button
              className="btn btn-add"
              type="button"
              onClick={handleConfirmSubmission}
              disabled={isConfirmingSubmission || isSaving || isSubmittingEntry}
            >
              {isConfirmingSubmission ? "Confirming..." : "Confirm Submission"}
            </button>
          </div>
        </div>
      ) : null}

      <section className="collaboration-grid">
        <article className="collaboration-card">
          <h2>Session Details</h2>
          <div className="details-grid">
            <div>
              <p className="detail-label">Room ID</p>
              <p className="detail-value detail-mono">{matchId ?? "-"}</p>
            </div>
            <div>
              <p className="detail-label">Question ID</p>
              <p className="detail-value">{resolvedQuestionId || "-"}</p>
            </div>
            <div>
              <p className="detail-label">Current User</p>
              <p className="detail-value">{currentUser.username ?? currentUser.email ?? "-"}</p>
            </div>
            <div>
              <p className="detail-label">Matched Peer</p>
              <p className="detail-value">{peerUsername}</p>
            </div>
            <div>
              <p className="detail-label">Peer Email</p>
              <p className="detail-value">{peerEmail || "-"}</p>
            </div>
            <div>
              <p className="detail-label">Topic / Difficulty</p>
              <p className="detail-value">{displayTopic} / {displayDifficulty}</p>
            </div>
          </div>

          <div className="collaboration-actions">
            <button
              className="btn btn-add"
              type="button"
              onClick={handleManualSave}
              disabled={isSaving || isSubmittingEntry}
            >
              {isSaving ? "Saving..." : "Save Now"}
            </button>
            <button
              className="btn btn-edit"
              type="button"
              onClick={handleSubmitEntry}
              disabled={
                isSaving ||
                isSubmittingEntry ||
                isConfirmingSubmission ||
                Boolean(session?.pendingSubmission)
              }
            >
              {isSubmittingEntry ? "Submitting..." : "Request Submission"}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/questions")}
            >
              Back to Question List
            </button>
            <button
              className="btn btn-edit"
              type="button"
              onClick={() => navigate(`/questions/${resolvedQuestionId}`)}
            >
              View Question
            </button>
          </div>
        </article>

        <article className="collaboration-card">
          <h2>{question?.title ?? "Selected Question"}</h2>
          <p className="collaboration-question-description">
            {question?.description ?? (isLoading ? "Loading question details..." : "Question details unavailable.")}
          </p>
          <p className="collaboration-question-meta">
            Last saved: {formatTimestamp(session?.submissionDate)}
          </p>
        </article>
      </section>

      <section className="collaboration-card">
        <div className="collaboration-editor-header">
          <div>
            <h2>Shared Code Editor</h2>
            <p className="collaboration-question-meta">
              Autosaves when you pause typing and refreshes peer changes regularly.
            </p>
          </div>
        </div>

        <textarea
          className="collaboration-editor"
          value={code}
          onChange={handleCodeChange}
          placeholder={isLoading ? "Connecting to shared editor..." : "Start coding together here..."}
          disabled={Boolean(loadError)}
          spellCheck={false}
        />
      </section>
    </div>
  );
}
