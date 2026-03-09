import React, { useEffect, useState } from "react";
import {
  getAllQuestions,
  deleteQuestion,
  updateQuestion,
} from "../api/questionService";
import "../styles/QuestionList.css";
import { Link } from "react-router-dom";

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editDraft, setEditDraft] = useState({
    questionID: "",
    title: "",
    description: "",
    category: "",
    complexity: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [questionStatus, setQuestionStatus] = useState("Active");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const getQuestionId = (question) =>
    question.questionID ?? question.questionId ?? "";

  const formatDateTime = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("en-SG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const normalizeCategory = (category) => {
    if (Array.isArray(category)) {
      return category.join(", ");
    }
    return String(category ?? "");
  };

  const fetchQuestions = async () => {
    try {
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  async function handleDelete(id) {
    try {
      await deleteQuestion(id);
      alert("Question deleted successfully");

      setQuestions(prevQuestions =>
        prevQuestions.filter(q => q._id !== id)
      );
  
    } catch (err) {
      alert(err.message);

      setQuestions(prevQuestions =>
        prevQuestions.filter(q => q._id !== id)
      );
    }
  }

  return (
    <div className="question-container">
      <div className="page-header">
        <h1>Admin - Question List</h1>
        <p>Full administrative access to all questions</p>
      </div>
      {statusMessage ? (
        <div className={`status-message ${statusType}`}>{statusMessage}</div>
      ) : null}
    <button className="btn btn-add">Add Question</button>
      <table className="question-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Category</th>
            <th>Complexity</th>
            <th colSpan="3">Created</th>
          </tr>
        </thead>

        <tbody>
          {questions.map((q) => (
            <tr key={q._id ?? getQuestionId(q)}>
                <td><Link to={`/admin/questions/${getQuestionId(q)}`}>{getQuestionId(q)}</Link></td>
                <td>{q.title}</td>
                <td>
                    {q.description}
                </td>
                <td>{normalizeCategory(q.category)}</td>
                <td>
                    <span className={`complexity ${q.complexity}`}>
                    {q.complexity}
                    </span>
                </td>
                <td>{formatDateTime(q.createdAt)}</td>
                <td>
                    <button onClick={() => handleOpenEdit(q)} className="btn btn-edit">Edit</button>
                </td>
                <td>
                    <button onClick={() => handleDelete(q._id)} className="btn btn-delete">Delete</button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isEditModalOpen ? (
        <div className="modal-backdrop" onClick={handleCloseEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Question Details</h2>
              <div className="modal-header-actions">
                <button
                  type="button"
                  className="btn btn-status-toggle"
                  onClick={handleToggleStatus}
                >
                  {questionStatus === "Active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  className="btn btn-close"
                  onClick={handleCloseEdit}
                >
                  Close
                </button>
              </div>
            </div>

            <p className="modal-section-title">Question Content</p>
            <div className="edit-form-grid">
              <label>
                Question ID
                <input
                  className="modal-input"
                  value={editDraft.questionID}
                  readOnly
                />
              </label>

              <label>
                Title
                <input
                  className="modal-input"
                  value={editDraft.title}
                  onChange={(e) => handleDraftChange("title", e.target.value)}
                />
              </label>

              <label>
                Description
                <textarea
                  className="modal-input modal-textarea"
                  rows={4}
                  value={editDraft.description}
                  onChange={(e) =>
                    handleDraftChange("description", e.target.value)
                  }
                />
              </label>

              <label>
                Category
                <input
                  className="modal-input"
                  value={editDraft.category}
                  onChange={(e) =>
                    handleDraftChange("category", e.target.value)
                  }
                />
              </label>

              <label>
                Complexity
                <input
                  className="modal-input"
                  value={editDraft.complexity}
                  onChange={(e) =>
                    handleDraftChange("complexity", e.target.value)
                  }
                />
              </label>
            </div>

            <p className="modal-section-title">Administrative Metadata</p>
            <div className="details-grid">
              <div>
                <p className="detail-label">Status</p>
                <p className="detail-value">{questionStatus}</p>
              </div>
              <div>
                <p className="detail-label">Created Date</p>
                <p className="detail-value">
                  {formatDateTime(editingQuestion?.createdAt)}
                </p>
              </div>
              <div>
                <p className="detail-label">Last Modified</p>
                <p className="detail-value">
                  {formatDateTime(editingQuestion?.updatedAt)}
                </p>
              </div>
              <div>
                <p className="detail-label">Document ID</p>
                <p className="detail-value detail-mono">
                  {editingQuestion?._id ?? "-"}
                </p>
              </div>
            </div>

            <div className="edit-modal-actions">
              <button
                type="button"
                className="btn btn-edit"
                onClick={handleSaveEdit}
                disabled={isSaveDisabled}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button type="button" className="btn btn-delete" onClick={handleCloseEdit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuestionList;
