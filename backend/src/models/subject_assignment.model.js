import mongoose from 'mongoose';
const { Schema } = mongoose;

const subjectAssignmentSchema = new Schema({
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    lecturer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true,
        enum: [1, 2]
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure a lecturer can only be assigned to a subject once per academic year and semester
subjectAssignmentSchema.index({ subject: 1, lecturer: 1, academicYear: 1, semester: 1 }, { unique: true });

const SubjectAssignment = mongoose.model('SubjectAssignment', subjectAssignmentSchema);
export default SubjectAssignment; 