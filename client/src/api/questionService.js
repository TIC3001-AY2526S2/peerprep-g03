const API_BASE = "http://localhost:5000/api/questions";

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export async function getQuestions() {
  const response = await fetch(API_BASE);
  return parseResponse(response);
}

export async function updateQuestion(id, payload) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}
