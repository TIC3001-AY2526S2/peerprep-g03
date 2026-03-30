import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  updateUserPrivilege
} from "../api/userService";
import { useNavigate } from "react-router-dom";
import "../styles/QuestionList.css";

const UserRegistry = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [errors, setErrors] = useState([]);

  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (!isAdmin) {
        navigate("/profile");
      } else {
        fetchUsers();
      }
  }, []);

  const fetchUsers = async () => {
    try {
      if (isAdmin) {
        const res = await getAllUsers();
        setUsers(res.data);
      } else {
        const res = await getUser(currentUserId);
        setUsers([res.data]);
      }
    } catch (err) {
      setStatusType("error");
      setStatusMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUserId) {
      alert("You cannot delete yourself.");
      return;
    }

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setStatusType("success");
      setStatusMessage("User deleted");
    } catch (err) {
      setStatusType("error");
      setStatusMessage(err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditDraft({
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
    });
  };

  const handleSave = async () => {
    try {
        setStatusType("");
        setStatusMessage("");
        setErrors([]);

        const originalUser = users.find((u) => u.id === editingUser.id);
        const payload = {};
        if (
            editDraft.username &&
            editDraft.username !== originalUser.username
          ) {
            payload.username = editDraft.username;
          }
      
          if (
            editDraft.email &&
            editDraft.email !== originalUser.email
          ) {
            payload.email = editDraft.email;
          }
      
          if (editDraft.password && editDraft.password.trim() !== "") {
            payload.password = editDraft.password;
          }
      
          const hasUserUpdate = Object.keys(payload).length > 0;
      
          if (hasUserUpdate) {
            await updateUser(editingUser.id, payload);
          }
      
          const shouldUpdateRole =
            isAdmin &&
            editingUser.id !== currentUserId &&
            editDraft.role !== originalUser.role;
      
          if (shouldUpdateRole) {
            await updateUserPrivilege(editingUser.id, {
              role: editDraft.role,
            });
          }
      
          if (!hasUserUpdate && !shouldUpdateRole) {
            setStatusType("success");
            setStatusMessage("No changes detected");
            return;
          }
      
          setStatusType("success");
          setStatusMessage("Updated successfully");
      
          fetchUsers();
    } catch (err) {
        const apiError = err.data;

        if (apiError?.errors) {
          setErrors([apiError.message, ...apiError.errors]);
        } else {
          setErrors([err.message || "Update failed"]);
        }
    
        setStatusType("error");
    } finally {
        setEditingUser(null);
        setEditDraft({});
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="question-container">
      <div className="page-header">
        <div>
          <h1>{isAdmin ? "User Registry" : "My Profile"}</h1>
          <p>{isAdmin ? "Manage all users" : "View and update your profile"}</p>
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

      {statusMessage && (
        <div className={`status-message ${statusType}`}>
          {statusMessage}
        </div>
      )}

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

      <table className="question-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleString()}</td>

              <td>
                <button className="btn btn-edit" onClick={() => handleEdit(user)}>
                  Edit
                </button>

                {isAdmin && (
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div className="modal-backdrop">
          <div className="edit-modal">
            <h2>Edit User</h2>

            <input
              value={editDraft.username}
              onChange={(e) =>
                setEditDraft({ ...editDraft, username: e.target.value })
              }
              placeholder="Username"
            />

            <input
              value={editDraft.email}
              onChange={(e) =>
                setEditDraft({ ...editDraft, email: e.target.value })
              }
              placeholder="Email"
            />

            <input
            type="password"
            placeholder="New Password (optional). Leave blank to keep password."
            value={editDraft.password}
            onChange={(e) =>
                setEditDraft({ ...editDraft, password: e.target.value })
            }
            />

            {isAdmin && editingUser.id !== currentUserId && (
                <select
                    value={editDraft.role}
                    onChange={(e) =>
                    setEditDraft({ ...editDraft, role: e.target.value })
                    }
                >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
                )}

            <div className="edit-modal-actions">
              <button onClick={handleSave} className="btn btn-edit">
                Save
              </button>
              <button onClick={() => setEditingUser(null)} className="btn btn-delete">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRegistry;