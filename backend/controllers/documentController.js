import Document from "../models/Document.js";
import FlashCard from "../models/FlashCard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";

// helper Function to process PDF
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);
    //  create chunks
    const chunks = chunkText(text, 500, 50);
    // upload Document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });
  } catch (error) {
    console.error(`Error processing Document ${documentId}`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }
    const { title } = req.body;

    if (!title) {
      // delete uload file if no title provided
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    // construct the URL for the upload file

    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    //  create a document record
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: "processing",
    });

    // Process PDF in background (in production , use a queue like bull)
    processPDF(document._id, req.file.path).catch((err) => {
      console.error("PDF processing error:", err);
    });
    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully, Processing in progress...",
    });
  } catch (error) {
    // clean up uploaded file in case of error
    if (req.file) {
      await fs
        .unlink(req.file.path)
        .catch((err) => console.error("File cleanup error:", err));
    }
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },

      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },

      {
        $sort: { uploadDate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document Not Found",
        statusCode: 404,
      });
    }

    // get count of associated Flashcards and quizzes
    const flashcardCount = await FlashCard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    //  update last accessed
    document.lastAccessed = Date.now();
    await document.save();

    //  combine document data with count

    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Doc Not Found",
        statusCode: 404,
      });
    }
    // delete file  from fileSystem
    await fs.unlink(document.filePath).catch(() => {});
    // delete document from db
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};
