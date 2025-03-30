import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  moduleCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  credit: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  description: {
    type: String,
    default: ""
  },
  department: {
    type: String,
    required: true
  },
  faculty: {
    type: String,
    required: true
  }
}, {timestamps: true});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject; 