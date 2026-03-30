const API_BASE_AUTH = "http://localhost:3001/auth";
const API_BASE_USER = "http://localhost:3001/users";

async function parseResponse(response) {
    const data = await response
      .json()
      .catch(async () => ({
        error: (await response.text().catch(() => "")) || "",
      }));
  
    if (!response.ok) {
      const error = new Error(
        data.message || data.error || `Request failed (${response.status})`
      );
  
      error.data = data;
  
      throw error;
    }
  
    return data;
  }

  export async function registerUser(payload) {
    const response = await fetch(API_BASE_USER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload), // { username, email, password }
    });
  
    return parseResponse(response);
  }

  export async function loginUser(payload) {
    const response = await fetch(`${API_BASE_AUTH}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload), // { email, password }
    });
  
    return parseResponse(response);
  }

  export async function verifyToken(token) {
    const response = await fetch(`${API_BASE_AUTH}/verify-token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    return parseResponse(response);
  }

  export async function getUser(id) {
    const response = await fetch(`${API_BASE_USER}/${id}`, {
        method: "GET",
      });
      return parseResponse(response);
  }
  
  export async function getAllUsers() {
    const token = localStorage.getItem("token");
    const response = await fetch(API_BASE_USER, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    return parseResponse(response);
  }

  export async function updateUser(id, payload) {
    const token = localStorage.getItem("token");
  
    const response = await fetch(`${API_BASE_USER}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  
    return parseResponse(response);
  }

  export async function updateUserPrivilege(id, payload) {
    const token = localStorage.getItem("token");
  
    const response = await fetch(`${API_BASE_USER}/${id}/privilege`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  
    return parseResponse(response);
  }
  
  export async function deleteUser(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_USER}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return parseResponse(response);
  }