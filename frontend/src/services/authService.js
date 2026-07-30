import api from "./api"; // tumhara axios instance

export const loginUser = async (username, password) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    
    // ✅ JWT ko localStorage me save karo
    const token = response.data.token;  // ya backend me jo field hai
    localStorage.setItem("token", token);

    console.log("Token saved:", token);
    return true;
  } catch (error) {
    console.error("Login failed", error);
    return false;
  }

};

// GET USER PROFILE
export const getMyProfile = async () => {

  const token = localStorage.getItem("token");

  const response = await api.get("/auth/me", {
    headers:{
      Authorization:`Bearer ${token}`
    }
  });

  return response.data;
};