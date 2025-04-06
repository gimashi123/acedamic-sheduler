import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    credits: {
      type: Number,
      default: 3,
    },
    department: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    priority: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
      description: 'Priority level from 1-10, higher means this subject gets scheduled first'
    },
    preferredDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: [],
      description: 'Days when this subject is preferably taught'
    },
    preferredTimeRanges: [{
      startTime: String,
      endTime: String,
      description: {
        type: String,

        default: 'Time ranges when this subject is preferably taught'
      }
    }],
    sessionDuration: {
      type: Number,
      default: 120, // minutes
      description: 'Duration of each session in minutes'
    },
    requiredVenueTypes: {
      type: [String],
      enum: ['lecture', 'tutorial', 'lab', 'any'],
      default: ['any'],
      description: 'Types of venues required for this subject'
    }
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;