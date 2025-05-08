import mongoose from "mongoose";
import slotSchema from "./slot.model.js";

const timetableSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    groupName: {
        type: String,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    slots: {
        type: [slotSchema],
        default: []
    }
}, { timestamps: true });

export default mongoose.model('TimeTable', timetableSchema);
