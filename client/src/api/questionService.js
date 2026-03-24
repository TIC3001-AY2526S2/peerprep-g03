import axios from "axios";

const API_BASE = "http://localhost:5050/api/questions";

async function parseResponse(response) {
  const data = await response
    .json()
    .catch(async () => ({
      error: (await response.text().catch(() => "")) || "",
    }));
    
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export async function getQuestions() {
  const response = await fetch(API_BASE);
  return parseResponse(response);
}

export async function createQuestion(payload){
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  
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

export async function deleteQuestion(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  return parseResponse(response);
}

export const getAllQuestions = async () => {
  const response = await axios.get(API_BASE);
  return response.data;
};
