import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  score: { type: Number, required: true },
  examType: { type: String, enum: ["test", "open"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Score = mongoose.model("Score", ScoreSchema);
export default Score;
