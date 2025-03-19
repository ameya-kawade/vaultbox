import { api, chatAPI } from "./api"; // Use `api` if your backend is on localhost:5000

// Call login API and store temporary user ID for OTP verification.
export const login = async (email, password) => {
  try {
    const response = await api.post(
      "/auth/login",
      { email, password },
      { withCredentials: true }
    );
    localStorage.setItem("tempUserId", response.data.userId);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Login failed");
  }
};

// Call verifyOTP API; after success, move tempUserId to permanent userId.
export const verifyOTP = async (otp) => {
  try {
    const userId = localStorage.getItem("tempUserId");
    if (!userId) throw new Error("User ID missing from temporary storage");

    const response = await api.post(
      "/auth/verify-otp",
      { userId, otp },
      { withCredentials: true }
    );
    localStorage.setItem("userId", userId);
    localStorage.removeItem("tempUserId");
    return { ...response.data, userId };
  } catch (error) {
    throw error.response?.data || new Error("OTP verification failed");
  }
};

// Retrieves user details from the backend using the permanent userId.
export const getUserById = async () => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("User ID not found");

    const response = await api.get(`/auth/user/${userId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    localStorage.removeItem("userId"); // Cleanup on error.
    throw error.response?.data || new Error("Failed to fetch user data");
  }
};

// Call the logout API and clear all locally stored user data.
export const logout = async () => {
  try {
    const response = await api.post("/auth/logout", {}, { withCredentials: true });
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error during logout");
  }
};
