// here we are setup schemas
import mongoose from "mongoose";

const venueSchema = new mongoose.Schema ({
    faculty: {
        type: String,
        required: true
    },

    department: {
        type: String,
        required: true
    },

    building: {
        type: String,
        required: true
    },

    hallName: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ['lecture', 'tutorial', 'lab'],
        required: true,
    },

    capacity: {
        type: Number,
        required: true,
        min: 1,
    },

    // showing the free and non-free lecture halls/labs
    bookedSlots: [
        {
            date: {
                type: Date,
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
        }
    ],
}, {timestamps: true});

const Venue = mongoose.model('Venue', venueSchema);
export default Venue;