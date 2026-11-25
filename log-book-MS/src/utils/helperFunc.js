import { API_URL } from "./api";

export const sendEmail = async (subject, text, token) => {
  try {
    await fetch(`${API_URL}/api/logbooks/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subject, text }),
    });
  } catch (error) {
    console.error("Error:", error);
  }
};
