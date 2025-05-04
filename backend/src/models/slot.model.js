import mongoose from "mongoose";


const slotSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
        required: true
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        required: true
    },
    startTime: {
        type: String,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm format
        required: true
    },
    endTime: {
        type: String,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm format
        required: true
    }
}, { timestamps: true });

export default  slotSchema
