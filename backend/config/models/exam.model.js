import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  exam: [
    {
      question: { type: String, required: true },
      options: { type: [String], default: [] }, 
      correctAnswer: { type: String, required: true }, 
    }
  ],
  responses: { type: [String], default: [] }, 
  examLocked: { type: Boolean, required: true, default: false },
  finalScore: { type: Number, default: null },
}, { timestamps: true });

const Exam = mongoose.model("Exam", examSchema);

export default Exam;