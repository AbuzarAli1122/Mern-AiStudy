import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPath";

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

const register = async (username, email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      username,
      email,
      password,
    });
    console.log(response);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fetching profile failed" };
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(API_PATHS.AUTH.PROFILE, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Updating profile failed" };
  }
};

const changePassword = async (passwords) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwords
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Changing password failed" };
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
};
export default authService;
