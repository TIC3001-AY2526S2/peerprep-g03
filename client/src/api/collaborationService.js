/*
AI Assistance Disclosure:
Tool: ChatGPT 5.4, date: 2026-04-11 to 2026-04-13
Scope: Assisted with implementation refinement for the collaboration service API calls.
Author review: I reviewed, edited, tested, and verified the final code. Requirements and architecture decisions were made by the team without AI.
*/
const API_BASE = "http://localhost:5052/api/collaboration";

// Parses the response from the collaboration service, handling both JSON and text responses, and throwing an error for all non-ok responses with the message from the response body if available.
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

// Adds the auth token to collaboration service requests.
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Gets the current collaboration session details
export async function getCollaborationSession(matchId, { questionId, peerEmail }) {
  const searchParams = new URLSearchParams({
    questionId: String(questionId ?? ""),
    peerEmail: String(peerEmail ?? ""),
  });

  const response = await fetch(`${API_BASE}/sessions/${matchId}?${searchParams.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}

// Sends the current collaboration answer to the backend and returns the saved session respons
export async function saveCollaborationAnswer(matchId, payload) {
  const response = await fetch(`${API_BASE}/sessions/${matchId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

// Submits the current answer for a collaboration session
export async function submitCollaborationAnswer(matchId, payload) {
  const response = await fetch(`${API_BASE}/sessions/${matchId}/submissions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

// Confirms a pending collaboration submission.
export async function confirmCollaborationSubmission(matchId, payload) {
  const response = await fetch(`${API_BASE}/sessions/${matchId}/submissions/confirm`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}
