const API_BASE = "http://localhost:5051/api/matching";

async function parseResponse(response) {
  const data = await response
    .json()
    .catch(async () => ({
      message: (await response.text().catch(() => "")) || "",
    }));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.data = data;
    throw error;
  }

  return data;
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function createMatchTicket(payload) {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function getMatchTicket(ticketId) {
  const response = await fetch(`${API_BASE}/tickets/${ticketId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}

export async function cancelMatchTicket(ticketId) {
  const response = await fetch(`${API_BASE}/tickets/${ticketId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}

export async function getMatchingDebugState() {
  const response = await fetch(`${API_BASE}/debug`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}
