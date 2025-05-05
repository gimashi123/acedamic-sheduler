import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    groupName: {
      type: String,
      required: [true, 'Group name is required']
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable; 