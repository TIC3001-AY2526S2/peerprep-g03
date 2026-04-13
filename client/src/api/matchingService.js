/*
AI Assistance Disclosure:
Tool: ChatGPT 5.4
Date: 2026-04-09 to 2026-04-13
Scope: Assisted with implementation refinement for the matching-service API calls.
Author review: I reviewed, edited, tested, and verified the final code. Requirements and architecture decisions were made by the team without AI.
*/
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

// Adds the auth token to matching requests.
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Starts a matching request.
export async function createMatchTicket(payload) {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

// Gets the current ticket status.
export async function getMatchTicket(ticketId) {
  const response = await fetch(`${API_BASE}/tickets/${ticketId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}

// Cancels the current matching request.
export async function cancelMatchTicket(ticketId) {
  const response = await fetch(`${API_BASE}/tickets/${ticketId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}

// Gets queue snapshot and debug logs.
export async function getMatchingDebugState() {
  const response = await fetch(`${API_BASE}/debug`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}
