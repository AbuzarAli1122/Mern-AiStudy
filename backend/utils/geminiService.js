import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "FATAL ERROR : GEMINI API KEY IS NOT SET IN THE ENVIRONMENT VARIABLES ",
  );
  process.exit(1);
}

export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
    Format each flashcard as:
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level : easy, medium or hard]
    
    Separate each flashcard with "---"
    
    Text:
    ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;

    // Parse the response
    const flashcards = [];
    const cards = generatedText.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }
    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini Api error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

//  Generate Quiz Questions

export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each question as:
    Q: [Question]
    01: [Option 1]
    02: [Option 2]
    03: [Option 3]
    04: [Option 4]
    C: [Correct option number only: 01, 02, 03 or 04  ]
    E: [Brief Explanation]
    D: [Difficulty : easy, medium or hard]
    
    Separate questions with "---"
    
    Text:
    ${text.substring(0, 15000)}
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    const questions = [];

    const questionBlocks = generatedText
      .split("---")
      .map((q) => q.trim())
      .filter((q) => q.length);

    for (const block of questionBlocks) {
      const lines = block.split("\n").map((l) => l.trim());

      let question = "",
        options = [],
        correctAnswer = null,
        explanation = "",
        difficulty = "medium";

      for (const line of lines) {
        
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (/^\d{2}:/.test(line)) {
          options.push(line.substring(3).trim());
        } else if (line.startsWith("C:")) {
           const raw = line.substring(2).trim();
          const numberMatch = raw.match(/^(\d{2})/);

          if (numberMatch) {
            correctAnswer = parseInt(numberMatch[1], 10) - 1;
          }
        } else if (line.startsWith("E:")) {
          explanation = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }
      if (question && options.length === 4 && correctAnswer !== null) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }
    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini Api Error:", error);
    throw new Error("Failed to generate Quiz");
  }
};

// Generate Document Summary

export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas and important points.
    Keep the summary clear and structured
    
    Text:
    ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    if (error.status === 429) {
      throw new Error(
        "Gemini API quota exceeded. Please wait or upgrade your plan.",
      );
    }

    console.error("Gemini Api Error:", error);
    throw new Error(error.message || "Failed to generate Summary");
  }
};

// Chat with the document context

export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}] \n ${c.content}`)
    .join("\n\n");

  const prompt = `Based on the following context from a document, Analyse the context and answer the user's question.
    
    Context:
    ${context}
    
    Question: ${question}

    Answer:
    `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini Api Error:", error);
    throw new Error("Failed to generate Summary");
  }
};

// Explain a specific concept

export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
  Provide a clear, educational explanations that's easy to understand.
  Include example if relevant.
  
  Context:
  ${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini Api Error:", error);
    throw new Error("Failed to explain concept");
  }
};
