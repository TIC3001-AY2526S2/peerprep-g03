import React, { useEffect, useState } from "react";

function App() {
  const [questions, setQuestions] = useState([]);

  // Fetch questions on component mount
  useEffect(() => {
    fetch("http://localhost:5000/api/questions")
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => console.error("Failed to fetch questions:", err));
  }, []);

  return (
    <div>
      <h1>Questions</h1>
      {questions.length === 0 ? (
        <p>No questions found.</p>
      ) : (
        <ul>
          {questions.map(q => (
            <li key={q._id}>
              <strong>{q.questionID}: {q.title}</strong>
              <p>{q.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;