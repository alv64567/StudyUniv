import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  response: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
