import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" }, 
  score: { type: Number, required: true },
  examType: { type: String, required: true },
  questions: [{ 
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, required: true }
  }],
  responses: { type: [String], default: [] },
  gradingResults: [{
    question: String,
    userAnswer: String,
    correctAnswer: String,
    score: Number,
    feedback: String
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Score", ScoreSchema);