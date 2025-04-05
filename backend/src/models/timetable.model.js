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
  },
  isLocked: {
    type: Boolean,
    default: false,
    description: 'If true, this time slot will not be changed during timetable optimization'
  },
  manuallyAssigned: {
    type: Boolean,
    default: false,
    description: 'If true, this time slot was assigned manually by an admin, not by the algorithm'
  },
  score: {
    type: Number,
    default: 0,
    description: 'A score indicating how optimal this assignment is'
  }
});

const preferredTimeSlotSchema = new Schema({
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  days: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: []
  },
  startTimes: {
    type: [String],
    default: []
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10,
    description: 'Priority level from 1-10, higher means more important'
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
  preferredTimes: [preferredTimeSlotSchema],
  includeWeekends: {
    type: Boolean,
    default: false
  },
  optimizationScore: {
    type: Number,
    default: 0
  },
  optimizationDetails: {
    gapScore: { type: Number, default: 0 },
    distributionScore: { type: Number, default: 0 },
    preferenceScore: { type: Number, default: 0 }
  },
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