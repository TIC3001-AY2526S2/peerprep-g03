import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUser } from "../api/userService";
import "../styles/QuestionList.css";

export default function Profile({ setAuth }) {
  const [user, setUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (storedUser) {
      setFormData({
        username: storedUser.username,
        email: storedUser.email,
        password: "",
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setAuth(false);
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const updatedUser = await updateUser(user.id, formData);

      localStorage.setItem("user", JSON.stringify(updatedUser.data));

      setUser(updatedUser.data);
      setMessage("Profile updated successfully");
      setIsEditOpen(false);
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="question-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>

        <div className="header-actions">
          <button onClick={() => navigate("/admin/questions")} className="btn btn-secondary">
            Questions
          </button>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && <div className="status-message success">{message}</div>}
      {error && <div className="status-message error">{error}</div>}

      {/* User Details */}
      <div className="details-grid">
        <div>
          <p className="detail-label">Username</p>
          <p className="detail-value">{user.username}</p>
        </div>

        <div>
          <p className="detail-label">Email</p>
          <p className="detail-value">{user.email}</p>
        </div>

        <div>
          <p className="detail-label">Role</p>
          <p className="detail-value">
            {user.role === "admin" ? "Admin" : "User"}
          </p>
        </div>

        <div>
          <p className="detail-label">Created At</p>
          <p className="detail-value">
            {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      {/* Update Button */}
      <button
        className="btn btn-edit"
        style={{ marginTop: "20px" }}
        onClick={() => setIsEditOpen(true)}
      >
        Update Profile
      </button>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditOpen(false)}>
          <div
            className="edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="edit-modal-header">
              <h2>Update Profile</h2>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="edit-form-grid">
                <label>
                  Username
                  <input
                    className="modal-input"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    className="modal-input"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  New Password
                  <input
                    className="modal-input"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                  />
                </label>
              </div>

              <div className="edit-modal-actions">
                <button type="submit" className="btn btn-edit">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}