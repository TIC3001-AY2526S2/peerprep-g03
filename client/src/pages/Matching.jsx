import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  cancelMatchTicket,
  createMatchTicket,
  getMatchTicket,
  getMatchingDebugState,
} from "../api/matchingService";
import { getAllQuestions } from "../api/questionService";
import "../styles/Matching.css";

const DEFAULT_TOPICS = ["Arrays", "Strings", "Graphs", "Dynamic Programming"];
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

function formatTimestamp(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-SG");
}

export default function Matching({ setAuth }) {
  const navigate = useNavigate();
  const pollRef = useRef(null);

  const [topicOptions, setTopicOptions] = useState(DEFAULT_TOPICS);
  const [formData, setFormData] = useState({
    topic: DEFAULT_TOPICS[0],
    difficulty: "Easy",
  });
  const [ticket, setTicket] = useState(null);
  const [timer, setTimer] = useState(30);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugState, setDebugState] = useState({ waitingCount: 0, queue: [], logs: [] });

  const isWaiting = ticket?.status === "waiting";
  const isMatched = ticket?.status === "matched";
  const isTimeout = ticket?.status === "timeout";
  const isCancelled = ticket?.status === "cancelled";

  const queueSummary = useMemo(() => {
    if (!debugState.queue.length) return "Queue is empty.";

    return debugState.queue
      .map((entry) => `${entry.userId} - ${entry.topic} / ${entry.difficulty}`)
      .join(" | ");
  }, [debugState.queue]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [questions, debug] = await Promise.all([
          getAllQuestions().catch(() => []),
          getMatchingDebugState().catch(() => ({
            data: { waitingCount: 0, queue: [], logs: [] },
          })),
        ]);

        if (!isMounted) return;

        const topics = Array.from(
          new Set(
            questions.flatMap((question) =>
              Array.isArray(question.category) ? question.category : [question.category],
            ),
          ),
        )
          .map((topic) => String(topic ?? "").trim())
          .filter(Boolean);

        const nextTopics = topics.length > 0 ? topics : DEFAULT_TOPICS;
        setTopicOptions(nextTopics);
        setFormData((current) => ({
          topic: nextTopics.includes(current.topic) ? current.topic : nextTopics[0],
          difficulty: current.difficulty,
        }));
        setDebugState(debug.data);
      } catch (error) {
        console.error("Failed to initialise matching page:", error);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isWaiting || !ticket?.ticketId) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return undefined;
    }

    pollRef.current = setInterval(async () => {
      try {
        const [ticketResponse, debugResponse] = await Promise.all([
          getMatchTicket(ticket.ticketId),
          getMatchingDebugState(),
        ]);

        setTicket(ticketResponse.data);
        setTimer(ticketResponse.data.remainingSeconds);
        setDebugState(debugResponse.data);

        if (ticketResponse.data.status === "matched") {
          setFeedback("Match found. This screen can be used for the successful match demo.");
          setFeedbackType("success");
        } else if (ticketResponse.data.status === "timeout") {
          setFeedback("No match found within 30 seconds. Retry or change your criteria.");
          setFeedbackType("error");
        }
      } catch (error) {
        setFeedback(error.message || "Unable to refresh matching status.");
        setFeedbackType("error");
      }
    }, 1000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isWaiting, ticket?.ticketId]);

  useEffect(() => () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setAuth(false);
    navigate("/login");
  };

  const refreshDebugState = async () => {
    try {
      const response = await getMatchingDebugState();
      setDebugState(response.data);
    } catch (error) {
      console.error("Failed to load queue debug state:", error);
    }
  };

  const handleStartMatching = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setFeedbackType("");

    try {
      const response = await createMatchTicket(formData);
      setTicket(response.data);
      setTimer(response.data.remainingSeconds);

      if (response.data.status === "matched") {
        setFeedback("Match found immediately.");
        setFeedbackType("success");
      } else {
        setFeedback("Searching the queue for a suitable peer.");
        setFeedbackType("info");
      }

      await refreshDebugState();
    } catch (error) {
      setFeedback(error.message || "Failed to start matching.");
      setFeedbackType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!ticket?.ticketId) return;

    try {
      const response = await cancelMatchTicket(ticket.ticketId);
      setTicket(response.data);
      setTimer(response.data.remainingSeconds);
      setFeedback(response.message || "Matching attempt cancelled.");
      setFeedbackType("error");
      await refreshDebugState();
    } catch (error) {
      setFeedback(error.message || "Failed to cancel matching.");
      setFeedbackType("error");
    }
  };

  const handleRetry = () => {
    setTicket(null);
    setTimer(30);
    setFeedback("");
    setFeedbackType("");
  };

  return (
    <div className="matching-page">
      <div className="page-header">
        <div>
          <h1>Peer Matching</h1>
          <p>Queue-based matching for Milestone 4.</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate("/questions")}>
            Questions
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/profile")}>
            Profile
          </button>
          <button className="btn btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {feedback ? <div className={`status-message ${feedbackType}`}>{feedback}</div> : null}

      <section className="matching-grid">
        <article className="matching-card">
          <h2>Matching Request</h2>
          <form className="matching-form" onSubmit={handleStartMatching}>
            <label>
              Topic
              <select
                className="modal-input"
                value={formData.topic}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, topic: event.target.value }))
                }
                disabled={isWaiting}
              >
                {topicOptions.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Difficulty
              <select
                className="modal-input"
                value={formData.difficulty}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, difficulty: event.target.value }))
                }
                disabled={isWaiting}
              >
                {DIFFICULTY_OPTIONS.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>

            <div className="matching-actions">
              <button className="btn btn-add" type="submit" disabled={isSubmitting || isWaiting}>
                {isSubmitting ? "Submitting..." : "Find Match"}
              </button>
              {isWaiting ? (
                <button className="btn btn-delete" type="button" onClick={handleCancel}>
                  Cancel
                </button>
              ) : null}
              {isMatched || isTimeout || isCancelled ? (
                <button className="btn btn-edit" type="button" onClick={handleRetry}>
                  Retry
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="matching-card">
          <h2>Live Status</h2>
          <div className="status-shell">
            <div className={`pulse-ring ${isWaiting ? "active" : ""}`}>
              <span>{timer}s</span>
            </div>
            <div className="status-copy">
              <p className="detail-label">Current status</p>
              <p className="detail-value">{ticket?.status ? ticket.status.toUpperCase() : "IDLE"}</p>
              <p className="matching-muted">
                {isWaiting
                  ? "Waiting for a peer with matching criteria."
                  : "Start a request to enter the queue."}
              </p>
            </div>
          </div>

          <div className="details-grid matching-details">
            <div>
              <p className="detail-label">Selected Topic</p>
              <p className="detail-value">{ticket?.criteria?.topic ?? formData.topic}</p>
            </div>
            <div>
              <p className="detail-label">Selected Difficulty</p>
              <p className="detail-value">{ticket?.criteria?.difficulty ?? formData.difficulty}</p>
            </div>
            <div>
              <p className="detail-label">Requested At</p>
              <p className="detail-value">{formatTimestamp(ticket?.requestedAt)}</p>
            </div>
            <div>
              <p className="detail-label">Match ID</p>
              <p className="detail-value">{ticket?.matchId ?? "-"}</p>
            </div>
          </div>

          {ticket?.peer ? (
            <div className="match-result success-panel">
              <h3>Matched Peer</h3>
              <p><strong>User:</strong> {ticket.peer.username}</p>
              <p><strong>Email:</strong> {ticket.peer.email}</p>
              <p><strong>Topic priority:</strong> matched on {ticket.criteria.topic}</p>
            </div>
          ) : null}

          {isTimeout ? (
            <div className="match-result error-panel">
              <h3>No Match Found</h3>
              <p>The request expired after 30 seconds. Retry or change topic or difficulty.</p>
            </div>
          ) : null}
        </article>
      </section>

      <section className="matching-grid">
        <article className="matching-card">
          <h2>Queue Snapshot</h2>
          <p className="matching-muted">Waiting users: {debugState.waitingCount}</p>
          <p className="queue-summary">{queueSummary}</p>
        </article>

        <article className="matching-card">
          <h2>Debug Log</h2>
          <div className="debug-log">
            {debugState.logs.length === 0 ? (
              <p className="matching-muted">No queue events yet.</p>
            ) : (
              debugState.logs.map((log) => (
                <div key={log.id} className="log-entry">
                  <p className="log-title">
                    {log.event} at {formatTimestamp(log.timestamp)}
                  </p>
                  <p className="log-line">
                    Queue before event:{" "}
                    {log.detail?.queueBefore?.length
                      ? log.detail.queueBefore
                          .map((entry) => `${entry.userId}:${entry.topic}/${entry.difficulty}`)
                          .join(" | ")
                      : "empty"}
                  </p>
                  <p className="log-line">
                    Queue after event:{" "}
                    {log.queue.length
                      ? log.queue
                          .map((entry) => `${entry.userId}:${entry.topic}/${entry.difficulty}`)
                          .join(" | ")
                      : "empty"}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
