import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPath";

const getAllFlashcardSets = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_ALL_FLASHCARDS_SETS,
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: " Failed to  Fetch flashcard sets" }
    );
  }
};

const getFlashcardsForDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch flashcards for document",
      }
    );
  }
};

const reviewFlashcard = async (cardId, cardIndex) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId, cardIndex),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to review flashcard" };
  }
};

const toggleStar = async (cardId) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId),
    );
    console.log("OnServiceResponse:", response);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to toggle star on flashcard" }
    );
  }
};

const deleteFlashcardSet = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete flashcard set" };
  }
};

const flashCardService = {
  getAllFlashcardSets,
  getFlashcardsForDocument,
  reviewFlashcard,
  toggleStar,
  deleteFlashcardSet,
};

export default flashCardService;
