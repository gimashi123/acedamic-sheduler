import mongoose from 'mongoose';

const scheduleEntrySchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  venue: {
    type: String
  }
});

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
    },
    subjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }],
    schedule: [scheduleEntrySchema]
  },
  {
    timestamps: true
  }
);

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;