import Timetable from '../models/timetable.model.js';

// @desc Get all timetables
// @route GET /timetables
export const getTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find();
        res.status(200).json(timetables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc Create a new timetable
// @route POST /timetables
export const createTimetable = async (req, res) => {
    try {
        const { course, instructor, day, startTime, endTime, venue } = req.body;

        if (!course || !instructor || !day || !startTime || !endTime || !venue) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newTimetable = new Timetable({ course, instructor, day, startTime, endTime, venue });
        await newTimetable.save();
        res.status(201).json(newTimetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getTimetableById = async (req, res) => {
    try {
        const { id } = req.params;
        const timetable = await Timetable.findById(id);
        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        const { course, instructor, day, startTime, endTime, venue } = req.body;

        if (!course || !instructor || !day || !startTime || !endTime || !venue) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const updatedTimetable = { course, instructor, day, startTime, endTime, venue };
        const timetable = await Timetable.findByIdAndUpdate(id, updatedTimetable, { new: true });
        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// @desc Delete a timetable
// @route DELETE /timetables/:id
export const deleteTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        await Timetable.findByIdAndDelete(id);
        res.status(200).json({ message: "Timetable deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
