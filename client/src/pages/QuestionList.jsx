import React, { useEffect, useState } from "react";
import { 
  createQuestion,
  getAllQuestions, 
  updateQuestion,
  deleteQuestion 
} from "../api/questionService";
import "../styles/QuestionList.css";
import { Link, useNavigate } from "react-router-dom";

const QuestionList = ({ setAuth }) => {
  const [questions, setQuestions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    category: "",
  });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: [],
    complexity: "",
  });

  const [categoryInput, setCategoryInput] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editDraft, setEditDraft] = useState({
    questionID: "",   //consider to remove from edit?
    title: "",
    description: "",
    category: "",
    complexity: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [questionStatus, setQuestionStatus] = useState("Active");
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("role") === "admin";

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setAuth(false);
    navigate("/login");
  };

  const getQuestionId = (question) =>
    question.questionID ?? question.questionID ?? "";

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

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const parseCategories = (input) => {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const handleCategoryChange = (e) => {
  const value = e.target.value;
  setCategoryInput(value);

  const parsed = parseCategories(value);

  setFormData((prev) => ({
    ...prev,
    category: parsed,
  }));

  setFieldErrors((prev) => ({
    ...prev,
    category:
      parsed.length === 0 ? "Please enter at least one category." : "",
  }));
};

const resetAddForm = () => {
    setFormData({
      title: "",
      description: "",
      category: [],
      complexity: "",
    });
    setCategoryInput("");
    setFieldErrors({ category: "" });
    setMessage("");
    setErrorMessage("");
  };

const handleOpenAdd = () => {
  resetAddForm();
  setShowAddForm(true);
};

const handleCloseAdd = () => {
  setShowAddForm(false);
  resetAddForm();
};

const handleCreateQuestion = async (e) => {
  e.preventDefault();

  console.log("Submit button pressed");
  console.log("Form data being sent:", formData);

  setMessage("");
  setErrorMessage("");

  const parsedCategories = parseCategories(categoryInput);

  if (parsedCategories.length === 0) {
    setFieldErrors((prev) => ({
      ...prev,
      category: "Please enter at least one category.",
    }));
    return;
  }

  const payload = {
    ...formData,
    category: parsedCategories,
  };

  try {
    const result = await createQuestion(payload);
    console.log("Create question success:", result);

    setStatusType("success");
    setStatusMessage("Question created successfully.");

    handleCloseAdd();
    await fetchQuestions();
  } catch (error) {
    console.error("Error creating question:", error);
    setErrorMessage(error.message || "Failed to create question.")
  }
};

  async function handleDelete(id) {
    try {
      await deleteQuestion(id);
      setQuestions((prevQuestions) => prevQuestions.filter((q) => q._id !== id));
      setStatusType("success");
      setStatusMessage("Question deleted successfully.");
    } catch (err) {
      setStatusType("error");
      setStatusMessage(err.message || "Failed to delete question.");
    }
  }

  const handleOpenEdit = (question) => {
    setEditingQuestion(question);
    setEditDraft({
      questionID: String(getQuestionId(question)),
      title: String(question.title ?? ""),
      description: String(question.description ?? ""),
      category: normalizeCategory(question.category),
      complexity: String(question.complexity ?? ""),
    });
    setQuestionStatus(String(question.status ?? "Active"));
    setStatusMessage("");
    setStatusType("");
    setIsSaving(false);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEditingQuestion(null);
    setIsSaving(false);
  };

  const handleDraftChange = (field, value) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleStatus = () => {
    setQuestionStatus((prev) => (prev === "Active" ? "Inactive" : "Active"));
  };

  const isSaveDisabled =
    isSaving ||
    !editDraft.questionID.trim() ||
    Number.isNaN(Number(editDraft.questionID)) ||
    !editDraft.title.trim() ||
    !editDraft.description.trim() ||
    !editDraft.category.trim() ||
    !editDraft.complexity.trim();

  const handleSaveEdit = async () => {
    if (!editingQuestion?._id) {
      setStatusType("error");
      setStatusMessage("Missing question id. Cannot update.");
      return;
    }

    try {
      setIsSaving(true);
      await updateQuestion(editingQuestion._id, {
        questionID: Number(editDraft.questionID),
        title: editDraft.title.trim(),
        description: editDraft.description.trim(),
        category: editDraft.category.trim(),
        complexity: editDraft.complexity.trim(),
      });

      await fetchQuestions();
      setStatusType("success");
      setStatusMessage("Question updated successfully.");
      handleCloseEdit();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.message || "Failed to update question.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="question-container">
      <div className="page-header">
        <div>
          <h1>
            {isAdmin ? "Admin - Question List" : "Question List"}
          </h1>
          <p>
            {isAdmin
              ? "Full administrative access to all questions"
              : "View all questions"}
          </p>
        </div>

        <div className="header-actions">
        <button className="btn btn-secondary" onClick={() => navigate("/matching")} > Find Match </button>
        {isAdmin ? (
          <button className="btn btn-secondary" onClick={() => navigate("/users")} > User Registry </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => navigate("/profile")} > My Profile </button>
        )}

          <button className="btn btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

    {statusMessage ? (
      <div className={`status-message ${statusType}`}>{statusMessage}</div>
    ) : null}

    {isAdmin && ( <button className="btn btn-add" onClick={handleOpenAdd} > Add Question </button>  )}

    {message && <p className="success-message">{message}</p>}
    {errorMessage && <p className="error-message">{errorMessage}</p>}

    <table className="question-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Category</th>
          <th>Complexity</th>
          {/* <th colSpan="3">Created</th> */}
          <th colSpan={isAdmin ? 3 : 1}>Created</th>
        </tr>
      </thead>

      <tbody>
        {questions.map((q) => (
          <tr key={q._id ?? getQuestionId(q)}>
              <td>
                {q.questionID}
              </td>
              <td>
                <Link to={`/questions/${getQuestionId(q)}`}>
                {q.title}
                </Link>
              </td>
              <td>
                {normalizeCategory(q.category)}
              </td>
              <td>
                <span className={`complexity ${q.complexity}`}>
                {q.complexity}
                </span>
              </td>
              <td>
                {formatDateTime(q.createdAt)}
              </td>
              {/* <td>
                  <button 
                    onClick={() => handleOpenEdit(q)} 
                    className="btn btn-edit"
                  >
                    Edit
                  </button>
              </td>
              <td>
                  <button 
                    onClick={() => handleDelete(q._id)}
                    className="btn btn-delete"
                  >
                    Delete
                  </button>
              </td> */}
              {isAdmin && (
                <>
                  <td>
                    <button 
                      onClick={() => handleOpenEdit(q)} 
                      className="btn btn-edit"
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDelete(q._id)}
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
          </tr>
        ))}
      </tbody>
    </table>

    {showAddForm ? (
      <div className="modal-backdrop" onClick={handleCloseAdd}>
        <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
          <div className="edit-modal-header">
            <h2>Add New Question</h2>
            <div className="modal-header-actions">
              <button
                type="button"
                className="btn btn-close"
                onClick={handleCloseAdd}
              >
                Close
              </button>
            </div>
          </div>

          <p className="modal-section-title">Question Content</p>

          <form onSubmit={handleCreateQuestion}>
            <div className="edit-form-grid">
              <label>
                Title
                <input
                  className="modal-input"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  className="modal-input modal-textarea"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Category
                <input
                  className="modal-input"
                  type="text"
                  name="category"
                  value={categoryInput}
                  onChange={handleCategoryChange}
                  placeholder="Enter categories separated by comma"
                  required
                />
                {fieldErrors.category ? (
                  <p className="field-error">{fieldErrors.category}</p>
                ) : null}
              </label>

              <label>
                Complexity
                <select
                  className="modal-input"
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select complexity</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </label>
            </div>

            <div className="edit-modal-actions">
              <button type="submit" className="btn btn-add">
                Submit
              </button>
              <button
                type="button"
                className="btn btn-delete"
                onClick={handleCloseAdd}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null}

    {isEditModalOpen ? (
      <div className="modal-backdrop" onClick={handleCloseEdit}>
        <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
          <div className="edit-modal-header">
            <h2>Question Details</h2>
            <div className="modal-header-actions">
              <button style={{ display: "none" }}
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
