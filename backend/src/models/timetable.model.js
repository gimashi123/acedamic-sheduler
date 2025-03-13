import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
    course: {
        type: String,
        required: true
    },
    instructor: {
        type: String,
        required: true
    },
    day: {
        type: String,
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
        type: String,
        required: true
    }
});

const TimeTable = mongoose.model('TimeTable', timetableSchema);

export default TimeTable;
