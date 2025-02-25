
import mongoose from 'mongoose';

const courseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    materials: [
      {
        type: String,
      },
    ],
    extractedText: {
      type: String, 
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;

