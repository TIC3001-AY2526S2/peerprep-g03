import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserRegistry from "./pages/UserRegistry";
import QuestionDetail from "./pages/QuestionDetail";
import QuestionList from "./pages/QuestionList";
import Profile from "./pages/Profile";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={ isAuthenticated ? ( <Navigate to="/admin/questions" /> ) : ( <Navigate to="/login" /> ) } />
        <Route path="/login" element={<Login setAuth={setIsAuthenticated}/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/users" element={ localStorage.getItem("role") === "admin" ? ( <UserRegistry /> ) : ( <Navigate to="/login" /> ) } />
        <Route path="/admin/questions" element={ isAuthenticated ? ( <QuestionList setAuth={setIsAuthenticated} /> ) : ( <Navigate to="/login" /> ) } />
        <Route path="/admin/questions/:id" element={ isAuthenticated ? ( <QuestionDetail /> ) : ( <Navigate to="/login" /> ) } />
        <Route path="/profile" element={ isAuthenticated ? <Profile setAuth={setIsAuthenticated} /> : <Navigate to="/login" /> } />
      </Routes>
    </Router>

  )
}

export default App;
