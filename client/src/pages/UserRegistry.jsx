import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUser,
  updateUser,
} from "../api/userService";
import { useNavigate } from "react-router-dom";
import "../styles/QuestionList.css";

const UserRegistry = () => {
  const [users, setUsers] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      setStatusType("error");
      setStatusMessage(err.message || "Failed to load users");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setStatusType("success");
      setStatusMessage("User deleted successfully.");
    } catch (err) {
      setStatusType("error");
      setStatusMessage(err.message || "Delete failed.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    return parsed.toLocaleString();
  };

  return (
    <div className="question-container">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1>Admin - User Registry</h1>
          <p>Manage all system users</p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/questions")}
          >
            Questions
          </button>

          <button className="btn btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`status-message ${statusType}`}>
          {statusMessage}
        </div>
      )}

      <table className="question-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Admin</th>
            <th>Created</th>
            <th colSpan="2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.username}</td>

              <td>
                <span
                  className={`complexity ${
                    user.isAdmin ? "Hard" : "Easy"
                  }`}
                >
                  {user.isAdmin ? "Admin" : "User"}
                </span>
              </td>

              <td>{formatDateTime(user.createdAt)}</td>

              <td>
                <button
                  className="btn btn-delete"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserRegistry;