const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";

export async function getUserProfile(userId, accessToken) {
  const response = await fetch(`${USER_SERVICE_URL}/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response
    .json()
    .catch(async () => ({ message: await response.text().catch(() => "") }));

  if (!response.ok) {
    const error = new Error(data.message || `Failed to load user ${userId}`);
    error.status = response.status;
    throw error;
  }

  return data.data;
}
