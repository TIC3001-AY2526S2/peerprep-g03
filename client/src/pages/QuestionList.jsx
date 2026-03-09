import React, { useEffect, useState } from "react";
import { 
  getAllQuestions, 
  createQuestion, 
  deleteQuestion 
} from "../api/questionService";
import "../styles/QuestionList.css";
import { Link } from "react-router-dom";

const QuestionList = () => {
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

  useEffect(() => {
    fetchQuestions();
  }, []);

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

    setMessage("Question created successfully.");

    setFormData({
      title: "",
      description: "",
      category: [],
      complexity: "",
    });

    setCategoryInput("");
    setFieldErrors({ category: "" });
    setShowAddForm(false);

    await fetchQuestions();
  } catch (error) {
    console.error("Error creating question:", error);
    setErrorMessage(error.message || "Failed to create question.")
  }
};

  const handleDelete = async (id) => {
    await deleteQuestion(id);
    fetchQuestions();
  };

  return (
    <div className="question-container">
      <div className="page-header">
        <h1>Admin - Question List</h1>
        <p>Full administrative access to all questions</p>
      </div>

    <button 
      className="btn btn-add"
      onClick={() => setShowAddForm(true)}
    >
      Add Question
    </button>

    {message && <p className="success-message">{message}</p>}
    {errorMessage && <p className="error-message">{errorMessage}</p>}

    {showAddForm && (
      <div className="add-question-form">
        <h2>Add New Question</h2>
        <form onSubmit={handleCreateQuestion}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"j
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={categoryInput}
              onChange={handleCategoryChange}
              placeholder={"Enter categories separated by comma"}
              required
            />
            {fieldErrors.category && (
              <p className="field-error">{fieldErrors.category}</p>
            )}
          </div>

          <div className="form-group">
            <label>Complexity</label>
            <select
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
          </div>

          <button type="submit" className="btn btn-add">
            Submit
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setShowAddForm(false)}
          >
            Cancel
          </button>
        </form>
      </div>
    )}

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
          <tr key={q.questionID}>
              <td><Link to={`/admin/questions/:${q.questionID}`}>{q.questionID}</Link></td>
              <td>{q.title}</td>
              <td>
                  {q.description}
              </td>
              <td>{q.category}</td>
              <td>
                  <span className={`Complexity ${q.complexity}`}>
                  {q.complexity}
                  </span>
              </td>
              <td>{new Date(q.createdAt).toLocaleDateString('en-SG', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                  })}
              </td>
              <td>
                  <Link to={`/admin/questions/${q.questionID}`} state={{ editMode: true }} className="btn btn-edit">Edit</Link>
              </td>
              <td>
                  <button onClick={() => handleDelete(q.questionID)} className="btn btn-delete">Delete</button>
              </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};

export default QuestionList;