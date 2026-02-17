import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPath";

const getDocuments = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fetching documents failed" };
  }
};

const uploadDocument = async (formData) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Uploading document failed" };
  }
};

const deleteDocument = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Deleting document failed" };
  }
};

const getDocumentById = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fetching document by ID failed" };
  }
};

const documentService = {
  getDocuments,
  uploadDocument,
  deleteDocument,
  getDocumentById,
};
export default documentService;
