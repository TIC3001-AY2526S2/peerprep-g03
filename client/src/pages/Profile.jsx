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
  const [errors, setErrors] = useState([]);

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
    setErrors("");

    try {
        const payload = {};
        if (formData.username && formData.username !== user.username) {
            payload.username = formData.username;
        }
    
        if (formData.email && formData.email !== user.email) {
            payload.email = formData.email;
        }

        if (formData.password && formData.password.trim() !== "") {
            payload.password = formData.password;
        }

        if (Object.keys(payload).length === 0) {
            setMessage("No changes detected");
            return;
        }
    
        const updatedUser = await updateUser(user.id, payload);
    
        const newData = updatedUser.data;
    
        localStorage.setItem("user", JSON.stringify(newData));
        setUser(newData);
    
        setFormData({
        username: newData.username,
        email: newData.email,
        password: "",
        });
    
        setMessage("Profile updated successfully");
    } catch (err) {
        setFormData({
            username: user.username,
            email: user.email,
            password: "",
          });
        const apiError = err.data;
        if (apiError?.errors) {
          setErrors([apiError.message, ...apiError.errors]);
        } else {
          setErrors([err.message || "Registration failed"]);
        }
    } finally {
        setIsEditOpen(false);
        
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
          <button onClick={() => navigate("/questions")} className="btn btn-secondary">
            Questions
          </button>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && <div className="status-message success">{message}</div>}
      {errors.length > 0 && (
          <div style={{ color: "red" }}>
            <p>{errors[0]}</p>
            <ul>
              {errors.slice(1).map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

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