import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import QuestionDetail from "./pages/QuestionDetail";
import QuestionList from "./pages/QuestionList";
function App() {
  return (
      <Router>
        <Routes>
          {/* DEFAULT PAGE */}
          <Route path="/" element={<Navigate to="/admin/questions" />} />
          <Route path="/admin/questions" element={<QuestionList />} />
          <Route path="/admin/questions/:id" element={<QuestionDetail />} />
        </Routes>
    </Router>
  )
}

export default App;
