import mongoose from "mongoose";

const summarySchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    topic: { type: String, required: true },
    summary: { type: String, required: true },
  },
  { timestamps: true }
);

const Summary = mongoose.model("Summary", summarySchema);
export default Summary;
