const API_BASE = "http://localhost:5052/api/collaboration";

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

export async function saveCollaborationAnswer(matchId, payload) {
  const response = await fetch(`${API_BASE}/sessions/${matchId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function submitCollaborationAnswer(matchId, payload) {
  const response = await fetch(`${API_BASE}/sessions/${matchId}/submissions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function confirmCollaborationSubmission(matchId, payload) {
  const response = await fetch(`${API_BASE}/sessions/${matchId}/submissions/confirm`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}
