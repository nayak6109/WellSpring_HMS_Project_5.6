import axios from "axios";

// ✅ Create axios instance
const api = axios.create({
  baseURL: "https://hospital-management-system-2026-6.onrender.com/api",
  timeout: 45000,
});

/* ================= REQUEST INTERCEPTOR ================= */
// 🔐 Automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // token should be saved as 'token' after login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Attaching token:", token); // debug
    } else {
      console.warn("⚠️ No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
// 🚨 Handle JWT Expired / Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ JWT expired or unauthorized");

      alert("Session expired. Please login again.");

      localStorage.removeItem("token"); // only remove token, keep other storage if needed
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* ================= LOGIN / TOKEN HANDLER ================= */
export const saveToken = (token) => {
  localStorage.setItem("token", token);
  console.log("✅ Token saved to localStorage:", token);
};

export const getToken = () => localStorage.getItem("token");

/*================Mail Services===================*/
export const sendMessage = (data) => api.post("/contact", data);
export const getAllMessages = () => api.get("/contact/admin");
export const getMessageById = (id) => api.get(`/contact/${id}`);
export const adminReply = (id, replyObj) => api.post(`/contact/admin/reply/${id}`, replyObj);

/*=====================Lab TEST=====================*/
// export const sendToLab = (data) => api.post("/lab-tests", data);
// export const getPendingTests = () => api.get("/lab-tests/pending");
// export const getByVisit = (visitId) => api.get(`/lab-tests/by-visit/${visitId}`);
// export const uploadReport = (id, url) => api.post(`/lab-tests/${id}/upload?url=${url}`);

export default api;