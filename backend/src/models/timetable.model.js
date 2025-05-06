import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    enum: ['08:00', '10:30', '13:00', '15:30'],
    required: true
  },
  endTime: {
    type: String,
    enum: ['10:00', '12:30', '15:00', '17:30'],
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const timetableSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  year: {
    type: Number,
    required: true
  },
  slots: [timeSlotSchema],
  generatedBy: {
    type: String,
    enum: ['system', 'admin', 'ai', 'hybrid'],
    default: 'system'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: String,
    enum: ['constraint', 'ai', 'final'],
    default: 'constraint'
  }
}, { timestamps: true });

// Method to check for conflicts
timetableSchema.methods.hasConflicts = function() {
  const slots = this.slots;
  
  // Check for venue conflicts
  const venueConflicts = slots.some((slot1, index1) => {
    return slots.some((slot2, index2) => {
      return (
        index1 !== index2 &&
        slot1.day === slot2.day &&
        slot1.startTime === slot2.startTime &&
        slot1.venue.toString() === slot2.venue.toString()
      );
    });
  });
  
  // Check for lecturer conflicts
  const lecturerConflicts = slots.some((slot1, index1) => {
    return slots.some((slot2, index2) => {
      return (
        index1 !== index2 &&
        slot1.day === slot2.day &&
        slot1.startTime === slot2.startTime &&
        slot1.lecturer.toString() === slot2.lecturer.toString()
      );
    });
  });
  
  return venueConflicts || lecturerConflicts;
};

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable; 