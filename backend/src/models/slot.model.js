import mongoose, {Schema} from "mongoose";

const slotSchema = new Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue'
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

} , {timestamps: true});