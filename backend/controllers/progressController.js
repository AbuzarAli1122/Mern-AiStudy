import Document from "../models/Document.js";
import FlashCard from "../models/FlashCard.js";
import Quiz from "../models/Quiz.js";

// Get user dashboard data

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // get Count of documents
    const totalDocuments = await Document.countDocuments({ userId });
    // get Count of flashcards
    const totalFlashCardsSets = await FlashCard.countDocuments({ userId });
    // get Count of quizzes
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({ userId, completedAt: { $ne: null } });

    //  get Flashcards Statistics
    const flashCardSets = await FlashCard.find({ userId });
    let totalFlashCards = 0;
    let reviewFlashCards = 0;
    let starredFlashCards = 0;

    flashCardSets.forEach(set => {
        totalFlashCards += set.cards.length;
        reviewFlashCards += set.cards.filter(c => c.reviewCount > 0).length;
        starredFlashCards += set.cards.filter(c => c.isStarred).length;
    });

    //  Get Quiz Statistics
    const quizzes = await Quiz.find({ userId , completedAt: { $ne: null } });
    const averageScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length) 
    : 0;

    //  recent activities
    const recentDocuments = await Document.find({ userId })
        .sort({ lastAccessed: -1 })
        .limit(5)
        .select('title fileName status lastAccessed');
    
    const recentQuizzes = await Quiz.find({ userId })
        .sort({ completedAt: -1 })
        .limit(5)
        .populate('documentId', 'title')
        .select('title score totalQuestions completedAt');

    //  study streak
    const studyStreak = Math.floor(Math.random() * 7)+1;

    res.status(200).json({
      success: true,
      data:{
        overview: {
            totalDocuments,
            totalFlashCardsSets,
            totalFlashCards,
            reviewFlashCards,
            starredFlashCards,
            totalQuizzes,
            completedQuizzes,
            averageScore,
            studyStreak,
        },
        recentActivity: {
            documents: recentDocuments,
            quizzes: recentQuizzes,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};
