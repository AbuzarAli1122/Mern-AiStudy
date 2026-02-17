import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPath";

const generateFlashCards = async (documentId, options) => {
  try {
    const reponse = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, {
      documentId,
      ...options,
    });
    return reponse.data;
  } catch (error) {
    throw error.response?.data || { message: "Generating flashcards failed" };
  }
};

const generateQuiz = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, {
      documentId,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Generating quiz failed" };
  }
};

const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, {
      documentId,
    });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Generating summary failed" };
  }
};

const chat = async (documentId, message) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
      documentId,
      question: message,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Chat failed" };
  }
};

const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, {
      documentId,
      concept,
    });

    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Explaining concept failed" };
  }
};

const getChatHistory = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.AI.GET_CHAT_HISTORY(documentId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting chat history failed" };
  }
};

const aiService = {
  generateFlashCards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};
export default aiService;
