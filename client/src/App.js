import React, { useEffect, useState } from "react";

function App() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/questions")
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array before calling map
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          console.error("Backend returned unexpected data:", data);
          setQuestions([]); // fallback to empty array
        }
      })
      .catch(err => {
        console.error("Failed to fetch questions:", err);
        setQuestions([]);
      });
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