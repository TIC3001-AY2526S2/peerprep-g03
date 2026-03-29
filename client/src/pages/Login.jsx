import { useState } from "react";
import { loginUser } from "../api/userService";
import "../styles/UserStyle.css";
import { useNavigate } from "react-router-dom";

export default function Login({ setAuth }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      try {
        const res = await loginUser({ email, password });
        const user = res.data;
        localStorage.setItem("token", user.accessToken);
        localStorage.setItem("role", user.role);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("user", JSON.stringify(user));
        setAuth(true);
        navigate("/admin/questions");
      } catch (err) {
        setError(err.message || "Login failed");
      }
    };
  
    return (
      <>
        <div className="navbar">
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </div>
  
        <div className="container">
          <h2>Login</h2>
  
          <form onSubmit={handleSubmit}>
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
  
            <button type="submit">Login</button>
          </form>
  
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </>
    );
  }