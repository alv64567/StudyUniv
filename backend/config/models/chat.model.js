import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  messages: [
    {
      sender: { type: String, enum: ["user", "ai"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Chat", chatSchema);
