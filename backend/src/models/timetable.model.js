import mongoose from 'mongoose';
const { Schema } = mongoose;

const timeSlotSchema = new Schema({
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
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  venue: {
    type: Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  lecturer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const timetableSchema = new Schema({
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  timeSlots: [timeSlotSchema],
  generatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, { timestamps: true });

// Compound index to ensure only one timetable per group per month/year
timetableSchema.index({ group: 1, month: 1, year: 1 }, { unique: true });

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable; 