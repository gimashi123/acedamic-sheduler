// here we are setup schemas 
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true
    },

    faculty: {
        type: String,
        required: true
    },

    department: {
        type: String,
        required: true
    },

    year: {
        type: Number, 
        required: true
    },

    semester: {
        type: Number, 
        required: true
    },

    groupType: {
        type: String,
        enum: ['weekday', 'weekend'],
        required: true,
    },

    students: {
        type: [String], // Store student IDs or names
        validate: [studentsLimit, 'A group cannot have more than 60 students'],
        default: []
    }

}, {timestamps: true});

// function to filter students 
function studentsLimit(val) {
    return val.length <= 60
}

const Group = mongoose.model('Group', groupSchema);
export default Group;