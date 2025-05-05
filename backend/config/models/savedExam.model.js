import mongoose from "mongoose";

const savedExamSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  examType: { type: String, required: true },
  exam: [
    {
      question: { type: String, required: true },
      options: [String],
      correctAnswer: { type: String, default: "" }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const SavedExam = mongoose.model("SavedExam", savedExamSchema);
export default SavedExam;
