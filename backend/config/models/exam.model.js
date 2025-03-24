import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
}, { timestamps: true });

const Exam = mongoose.model("Exam", examSchema);

export default Exam;