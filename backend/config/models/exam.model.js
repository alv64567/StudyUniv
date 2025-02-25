import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  exam: { type: Array, required: true },
  responses: { type: Object, required: true },
  examLocked: { type: Boolean, required: true },
  finalScore: { type: Number, default: null }
});

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
