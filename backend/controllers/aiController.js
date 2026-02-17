import Document from "../models/Document.js";
import FlashCard from "../models/FlashCard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";

// Generate FlashCard from Document
export const generateFlashCards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;
    if (!documentId) {
      return res.status(404).json({
        success: false,
        error: "Please Provide DocumentId",
        statusCode: 404,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // Generate card using Ai

    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      parseInt(count),
    );

    // Save to database
    const flashCardSet = await FlashCard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(200).json({
      success: true,
      data: flashCardSet,
      message: "FlashCard generate Successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Generate Quiz from Document
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 5, title } = req.body;
    if (!documentId) {
      return res.status(404).json({
        success: false,
        error: "Please Provide DocumentId",
        statusCode: 404,
      });
    }
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not Found or not ready",
        statusCode: 404,
      });
    }
    // Generate Quiz

    const questionGenerated = await geminiService.generateQuiz(
      document.extractedText,
      parseInt(numQuestions),
    );
    // save in db
    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: title || `${document.title} - Quiz`,
      questions: questionGenerated,
      totalQuestions: questionGenerated.length,
      userAnswer: [],
      score: 0,
    });

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz Generated Successfully",
    });
  } catch (error) {
    next(error);
  }
};

//  Generate Document Summary
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(404).json({
        success: false,
        error: "Please Provide DocumentId",
        statusCode: 404,
      });
    }
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not Found or not ready",
        statusCode: 404,
      });
    }
    // Generate Summary
    const Summary = await geminiService.generateSummary(document.extractedText);
    res.status(201).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        Summary,
      },
      message: "Summary created Successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Chat With Document
export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(404).json({
        success: false,
        error: "Please Provide DocumentId and Question",
        statusCode: 404,
      });
    }
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not Found or not ready",
        statusCode: 404,
      });
    }
    // Find relevant Chunks
    const relevantChunks = findRelevantChunks(document.chunks, question, 3);
    const chunkIndices = relevantChunks.map((c) => c.chunkIndex);

    // get or create chatHistory
    const chathistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: document._id,
    });

    if (!chathistory) {
      // create new chat history
      chathistory = await ChatHistory.create({
        userId: req.user._id,
        documentId: document._id,
        messages: [],
      });
    }
    // Get answer from Ai
    const answer = await geminiService.chatWithContext(
      question,
      relevantChunks,
    );
    // save chat message to db
    chathistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      },
    );
    await chathistory.save();

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: chathistory._id,
      },

      message: "Response generated Successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Explain concept from document
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;
    if (!documentId || !concept) {
      return res.status(404).json({
        success: false,
        error: "Please Provide DocumentId and Concept",
        statusCode: 404,
      });
    }
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not Found or not ready",
        statusCode: 404,
      });
    }
    // Find relevant Chunks
    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);

    const context = relevantChunks.map((c) => c.content).join("\n\n");
    // Get Explanation from Ai
    const explanation = await geminiService.explainConcept(concept, context);
    res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map((c) => c.chunkIndex),
      },
      message: "Explanation generated Successfully",
    });
  } catch (error) {
    next(error);
  }
};

// get Chat History for a doc
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    if (!documentId) {
      return res.status(404).json({
        success: false,
        error: "Please Provide DocumentId",
        statusCode: 404,
      });
    }
    const chathistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: documentId,
    }).select("messages");
    if (!chathistory) {
      return res.status(404).json({
        success: true,
        data: [],
        error: "No Chat History Found for this Document",
        statusCode: 404,
      });
    }
    res.status(200).json({
      success: true,
      data: chathistory.messages,
      message: "Chat History fetched Successfully",
    });
  } catch (error) {
    next(error);
  }
};
