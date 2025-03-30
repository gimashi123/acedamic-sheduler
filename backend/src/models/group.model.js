// here we are setup schemas 
import mongoose from 'mongoose';
const { Schema } = mongoose;

const FACULTIES = [
  'Engineering', 
  'Science', 
  'Business', 
  'Arts', 
  'Medicine', 
  'Law',
  'Education'
];

const DEPARTMENTS = {
  'Engineering': ['Computer Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering'],
  'Science': ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
  'Business': ['Accounting', 'Management', 'Marketing', 'Finance', 'Economics'],
  'Arts': ['English', 'History', 'Philosophy', 'Languages', 'Fine Arts'],
  'Medicine': ['General Medicine', 'Surgery', 'Pediatrics', 'Psychiatry'],
  'Law': ['Criminal Law', 'Civil Law', 'International Law', 'Corporate Law'],
  'Education': ['Early Childhood', 'Elementary Education', 'Secondary Education', 'Special Education']
};

const groupSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    faculty: {
        type: String,
        required: true,
        enum: FACULTIES,
        trim: true
    },

    department: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(department) {
                // Check if the department belongs to the selected faculty
                if (!this.faculty) return true; // Skip validation if faculty not set
                return DEPARTMENTS[this.faculty]?.includes(department);
            },
            message: props => `${props.value} is not a valid department for the selected faculty`
        }
    },

    year: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },

    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 2
    },

    groupType: {
        type: String,
        required: true,
        enum: ['weekday', 'weekend'],
        default: 'weekday'
    },

    students: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        validate: [studentsLimit, 'A group cannot have more than 30 students'],
        default: []
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

// Function to limit students to 30 per group
function studentsLimit(val) {
    return val.length <= 30;
}

// Static method to check if faculty already has 2 groups
groupSchema.statics.checkFacultyGroupLimit = async function(faculty) {
    const count = await this.countDocuments({ faculty });
    return count < 2;
};

// Static method to get all valid faculties
groupSchema.statics.getFaculties = function() {
    return FACULTIES;
};

// Static method to get departments for a faculty
groupSchema.statics.getDepartments = function(faculty) {
    return DEPARTMENTS[faculty] || [];
};

const Group = mongoose.model('Group', groupSchema);
export default Group;