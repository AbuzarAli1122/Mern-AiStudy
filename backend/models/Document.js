import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title for the document"],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
    },
    filePath: {
      type: String,
      required: [true, "File path is required"],
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
    },
    extractedText: {
      type: String,
      default: "",
    },
    chunks: [
      {
        content: {
          type: String,
          required: true,
        },
        pageNumber: {
          type: Number,
          default: 0,
        },
        chunkIndex: {
          type: Number,
          required: true,
        },
      },
    ],
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

// index for faster queries 
DocumentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.model("Document", DocumentSchema);

export default Document;
