import axios from "axios";
import { BASE_URL } from "./apiPath";

const axiosInstance = axios.create({
  baseURL: 'https://mern-aistudy.onrender.com',
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ================================
   REQUEST INTERCEPTOR
================================ */

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ================================
   RESPONSE INTERCEPTOR
================================ */

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // 🔥 TOKEN EXPIRED / UNAUTHORIZED
      if (status === 401 || status === 403) {
        console.warn("Session expired. Logging out...");

        // Remove stored auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login and prevent back navigation
        window.location.replace("/login");
      }

      // Server Error
      if (status === 500) {
        console.error(
          "Server Error. Please try again later:",
          error.response.data,
        );
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request Timeout. Please try again.");
    } else {
      console.error("Network Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
