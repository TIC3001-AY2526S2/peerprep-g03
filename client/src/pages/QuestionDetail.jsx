import { useEffect, useMemo, useState } from "react";
import "../styles/QuestionDetail.css";
import { useParams, useLocation } from "react-router-dom";
import { getQuestions, updateQuestion } from "../api/questionService";

const initialQuestion = {
  id: "",
  questionID: "",
  title: "",
  description: "",
  example: "",
  category: "",
  complexity: "",
  tags: [],
  popularityScore: 0,
  createdDate: "",
  lastModified: "",
  status: "Inactive",
  createdBy: "",
  timesUsed: 0,
  sessionsStarted: 0,
  successRate: 0,
  avgTime: 0,
  userRating: 0,
};

function QuestionDetail() {
  const [isEditing, setIsEditing] = useState(false);
  const [question, setQuestion] = useState(initialQuestion);
  const [draft, setDraft] = useState(initialQuestion);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const location = useLocation();
  const editModeFromLink = location.state?.editMode ?? false;
  const { id } = useParams();
  useEffect(() => {
    const loadQuestion = async () => {
      try {
        if (editModeFromLink) {
          setIsEditing(true);
        }

        const questions = await getQuestions();
        if (!questions.length) {
          setStatusType("error");
          setStatusMessage("No questions found in database.");
          setIsLoading(false);
          return;
        }

        const selectedQuestion =
          questions.find((q) => String(q.questionID) === String(id)) ||
          questions.find((q) => String(q.questionID) === String(id)) ||
          questions.find((q) => String(q._id) === String(id));

        if (!selectedQuestion) {
          setStatusType("error");
          setStatusMessage(`Question with ID ${id} was not found.`);
          setIsLoading(false);
          return;
        }

        const mappedQuestion = {
          id: selectedQuestion._id,
          questionID:
            selectedQuestion.questionID ?? selectedQuestion.questionID ?? "",
          title: String(selectedQuestion.title ?? ""),
          description: String(selectedQuestion.description ?? ""),
          category: Array.isArray(selectedQuestion.category)
            ? selectedQuestion.category.map((item) => String(item)).join(", ")
            : String(selectedQuestion.category ?? ""),
          complexity: String(selectedQuestion.complexity ?? ""),
          example: "",
          tags: [],
          popularityScore: 0,
          createdDate: selectedQuestion.createdAt
            ? new Date(selectedQuestion.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "",
          lastModified: selectedQuestion.updatedAt
            ? new Date(selectedQuestion.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "",
          status: "Active",
          createdBy: "",
          timesUsed: 0,
          sessionsStarted: 0,
          successRate: 0,
          avgTime: 0,
          userRating: 0,
        };

        setQuestion(mappedQuestion);
        setDraft(mappedQuestion);
      } catch (error) {
        setStatusType("error");
        setStatusMessage(error.message || "Failed to load question.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestion();
  }, [id, editModeFromLink]);

  const saveDisabled = useMemo(() => {
    return (
      !String(draft.questionID).trim() ||
      Number.isNaN(Number(draft.questionID)) ||
      !String(draft.title ?? "").trim() ||
      !String(draft.description ?? "").trim() ||
      !String(draft.category ?? "").trim() ||
      !String(draft.complexity ?? "").trim()
    );
  }, [draft]);

  const onStartEdit = () => {
    setDraft(question);
    setIsEditing(true);
  };

  const onCancelEdit = () => {
    setDraft(question);
    setIsEditing(false);
    setStatusMessage("");
  };

  const onSaveEdit = async () => {
    if (!question.id) {
      setStatusType("error");
      setStatusMessage("Question id missing. Cannot update.");
      return;
    }

    try {
      const updated = await updateQuestion(question.id, {
        questionID: Number(draft.questionID),
        title: String(draft.title ?? ""),
        description: String(draft.description ?? ""),
        category: String(draft.category ?? ""),
        complexity: String(draft.complexity ?? ""),
      });

      const nextQuestion = {
        ...question,
        questionID:
          updated.questionID ?? updated.questionID ?? draft.questionID,
        title: String(updated.title ?? ""),
        description: String(updated.description ?? ""),
        category: Array.isArray(updated.category)
          ? updated.category.map((item) => String(item)).join(", ")
          : String(updated.category ?? ""),
        complexity: String(updated.complexity ?? ""),
        tags: draft.tags.map((tag) => tag.trim()).filter(Boolean),
        lastModified: new Date(
          updated.updatedAt || Date.now(),
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };

      setQuestion(nextQuestion);
      setDraft(nextQuestion);
      setStatusType("success");
      setStatusMessage("Question updated successfully.");
      setIsEditing(false);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.message || "Failed to update question.");
    }
  };

  const onToggleStatus = () => {
    const nextStatus = question.status === "Active" ? "Inactive" : "Active";
    setQuestion((prev) => ({ ...prev, status: nextStatus }));
    if (isEditing) {
      setDraft((prev) => ({ ...prev, status: nextStatus }));
    }
  };

  const model = isEditing ? draft : question;

  const onFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const onTagsChange = (value) => {
    const tags = value.split(",").map((tag) => tag.trim());
    setDraft((prev) => ({ ...prev, tags }));
  };

  return (
    <main className="question-detail-page">
      {statusMessage ? (
        <div className={`status-message ${statusType}`}>{statusMessage}</div>
      ) : null}

      {isLoading ? <p className="body-text">Loading question...</p> : null}

      <section className="admin-header block">
        <div>
          <p className="section-label">Page Header - Admin</p>
          <h1>Admin - Question Details</h1>
          <p className="subtext">Full administrative access to question data</p>
        </div>

        <div className="header-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onSaveEdit}
                disabled={saveDisabled}
              >
                Save
              </button>
              <button type="button" className="btn" onClick={onCancelEdit}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className="btn" onClick={onStartEdit}>
              Edit
            </button>
          )}
          <button type="button" className="btn" onClick={onToggleStatus}>
            {question.status === "Active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      </section>

      <section className="block">
        <p className="section-label">Question Content</p>

        <article className="panel">
          <p className="section-label">Question ID</p>
          {isEditing ? (
            <input
              value={model.questionID}
              onChange={(e) => onFieldChange("questionID", e.target.value)}
              className="text-input short"
            />
          ) : (
            <p className="body-text">{model.questionID}</p>
          )}
        </article>

        <article className="panel">
          <p className="section-label">Question Title</p>
          {isEditing ? (
            <input
              value={model.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              className="text-input"
            />
          ) : (
            <p className="body-text">{model.title}</p>
          )}
        </article>

        <article className="panel">
          <p className="section-label">Full Description</p>
          {isEditing ? (
            <textarea
              value={model.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              className="text-area"
              rows={4}
            />
          ) : (
            <p className="body-text">{model.description}</p>
          )}

          <div className="example-box">
            <p className="example-title">Example:</p>
            {isEditing ? (
              <textarea
                value={model.example}
                onChange={(e) => onFieldChange("example", e.target.value)}
                className="text-area text-area-example"
                rows={3}
              />
            ) : (
              <pre>{model.example}</pre>
            )}
          </div>
        </article>

        <article className="panel">
          <p className="section-label">Metadata</p>
          <div className="two-column-grid">
            <div>
              <p className="field-label">Topic Classification:</p>
              {isEditing ? (
                <input
                  value={model.category}
                  onChange={(e) => onFieldChange("category", e.target.value)}
                  className="text-input short"
                />
              ) : (
                <span className="tag">{model.category}</span>
              )}
            </div>
            <div>
              <p className="field-label">Difficulty Level:</p>
              {isEditing ? (
                <input
                  value={model.complexity}
                  onChange={(e) => onFieldChange("complexity", e.target.value)}
                  className="text-input short"
                />
              ) : (
                <span className="tag">{model.complexity}</span>
              )}
            </div>
          </div>
        </article>

        <article className="panel">
          <p className="section-label">Tags</p>
          {isEditing ? (
            <input
              value={model.tags.join(", ")}
              onChange={(e) => onTagsChange(e.target.value)}
              className="text-input"
              placeholder="comma-separated tags"
            />
          ) : (
            <div className="tag-row">
              {model.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <p className="section-label">Administrative Metadata</p>
          <div className="stats-grid">
            <div>
              <p className="field-label">Popularity Score</p>
              <p className="value-strong">{model.popularityScore}/100</p>
            </div>
            <div>
              <p className="field-label">Created Date</p>
              <p>{model.createdDate}</p>
            </div>
            <div>
              <p className="field-label">Last Modified</p>
              <p>{model.lastModified}</p>
            </div>
            <div>
              <p className="field-label">Status</p>
              <span className="tag">{model.status}</span>
            </div>
            <div>
              <p className="field-label">Created By</p>
              <p>{model.createdBy}</p>
            </div>
            <div>
              <p className="field-label">Times Used</p>
              <p>{model.timesUsed.toLocaleString()}</p>
            </div>
          </div>
        </article>

        <article className="panel">
          <p className="section-label">Usage Statistics</p>
          <div className="usage-grid">
            <div>
              <p className="field-label">Sessions Started</p>
              <p className="value-strong">
                {model.sessionsStarted.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="field-label">Success Rate</p>
              <p className="value-strong">{model.successRate}%</p>
            </div>
            <div>
              <p className="field-label">Avg Time (min)</p>
              <p className="value-strong">{model.avgTime}</p>
            </div>
            <div>
              <p className="field-label">User Rating</p>
              <p className="value-strong">{model.userRating}/5.0</p>
            </div>
          </div>
        </article>
      </section>

      <section className="block">
        <p className="section-label">Admin Privileges</p>
        <p className="body-text">
          <strong>Admin Privileges:</strong> You have full access to edit
          question content, modify metadata, and change question status.
          Deactivating a question will hide it from users but preserve all data.
        </p>
      </section>
    </main>
  );
}

export default QuestionDetail;
