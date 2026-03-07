import React, { useEffect, useState } from "react";
import { getAllQuestions, deleteQuestion } from "../api/questionService";
import "../styles/QuestionList.css";
import { Link } from "react-router-dom";
const QuestionList = () => {
  const [questions, setQuestions] = useState([]);

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
    <button className="btn btn-add">Add Question</button>
      <table className="question-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Category</th>
            <th>Complexity</th>
            <th colspan="3">Created</th>
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