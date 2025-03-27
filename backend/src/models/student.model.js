import mongoose, { Schema } from 'mongoose';

const studentSchema = new Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      match: [/^[A-Za-z0-9]+$/, 'Student ID must be alphanumeric']
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      minLength: [2, 'First name must be at least 2 characters'],
      maxLength: [50, 'First name cannot exceed 50 characters'],
      match: [/^[A-Za-z ]+$/, 'First name can only contain letters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      minLength: [2, 'Last name must be at least 2 characters'],
      maxLength: [50, 'Last name cannot exceed 50 characters'],
      match: [/^[A-Za-z ]+$/, 'Last name can only contain letters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\d{10,15}$/, 'Phone number must be between 10-15 digits'],
    },
    degreeProgram: {
      type: String,
      required: [true, 'Degree program is required'],
      enum: ['BSc IT', 'BSc CS', 'BSc SE', 'BSc DS', 'BSc IS', 'Other'] // Add your degree programs
    },
    groupNumber: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Student group is required']
    },
    subjectsEnrolled: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'At least one subject is required']
    }],
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function(value) {
          return new Date().getFullYear() - value.getFullYear() >= 18;
        },
        message: 'Student must be at least 18 years old'
      }
    },
    guardianContact: {
      type: String,
      match: [/^\d{10,15}$/, 'Guardian phone number must be between 10-15 digits']
    },
    address: {
      type: String,
      minLength: [10, 'Address must be at least 10 characters'],
      maxLength: [255, 'Address cannot exceed 255 characters']
    }
  },
  { timestamps: true }
);

// Auto-generate student ID if not provided
studentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    // Generate a random alphanumeric ID
    const randomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.studentId = `S${randomId}`;
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);

export default Student;