import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
    slots: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Slot'
        }
    ],
    description: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },

    isPublished: {
        type: Boolean,
        default: false
    },

    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Group'
    },

});

const TimeTable = mongoose.model('TimeTable', timetableSchema);

export default TimeTable;
