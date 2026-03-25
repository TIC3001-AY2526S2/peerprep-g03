import React, { useEffect, useState } from "react";
import { registerUser } from "../api/userService";
import "../styles/UserStyle.css";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setMessage("");
      try {
        const data = await registerUser({ username, email, password, });
        setMessage("Registration successful! Redirecting to login page...");
        setTimeout(() => {
            navigate("/login");
          }, 1000);
      } catch (err) {
        setError(err.message || "Registration failed");
      }
    };
  
    return (
      <>
        <div className="navbar">
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </div>
  
        <div className="container">
          <h2>Register</h2>
  
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
  
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
  
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
  
            <button type="submit">Register</button>
          </form>
  
          {error && <p style={{ color: "red" }}>{error}</p>}
          {message && <p>{message}</p>}
        </div>
      </>
    );
  }