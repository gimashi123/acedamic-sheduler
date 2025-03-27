import mongoose from "mongoose";


const timetableSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    groupName: { type: String, required: true },
    isPublished: {
        type: Boolean,
        default: false
    },// Store only the group name
});


const TimeTable = mongoose.model('TimeTable', timetableSchema);

export default TimeTable;
