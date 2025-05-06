import Timetable from '../models/timetable.model.js';
import {errorResponse, HTTP_STATUS, successResponse} from "../config/http.config.js";
import {timeTableResponseDto} from "../dto/timeTable.response.dto.js";

// @desc Get all timetables
// @route GET /api/timetable/get/all
export const getTimetables = async (req, res) => {
    try {
        // Fetch all timetables from MongoDB
        const timetables = await Timetable.find();
        // If no timetables exist, return a 404 response
        if (!timetables || timetables.length === 0) {
            return errorResponse(res, "No timetables found", HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(
            res,
            "Timetables fetched successfully",
            HTTP_STATUS.OK,
            timetables.map((timetable) => {
                return timeTableResponseDto(timetable);
            })
        );

    } catch (error) {
        console.error("Error fetching timetables:", error);
        return errorResponse(res, "Failed to fetch timetables", HTTP_STATUS.SERVER_ERROR);
    }
};

// @desc Get a specific timetable by ID
// @route GET /api/timetable/get/:id
export const getTimetableById = async (req, res) => {
    try {
        const { id } = req.params;
        const timetable = await Timetable.findById(id);

        if(!timetable){
            return errorResponse(res, "Timetable not found", HTTP_STATUS.NOT_FOUND);
        }
       return successResponse(res, "Timetable fetched successfully", HTTP_STATUS.OK, timeTableResponseDto(timetable))
    } catch (error) {
        console.error("Error fetching timetable:", error);
        return errorResponse(res, "Server error occurred while fetching timetable", HTTP_STATUS.SERVER_ERROR);
    }
}

// @desc Create a new timetable
// @route POST /api/timetable/create
export const createTimetable = async (req, res) => {
    try {
        const { title, description, groupName, isPublished } = req.body;

        // Validate request
        if (!title || !description || !groupName) {
            return errorResponse(res, "All fields are required", HTTP_STATUS.BAD_REQUEST);
        }

        // Create and save the timetable
        const newTimetable = new Timetable({ 
            title, 
            description, 
            groupName,
            isPublished: isPublished !== undefined ? isPublished : false
        });
        await newTimetable.save();

        return successResponse(
            res,
            "Timetable created successfully",
            HTTP_STATUS.CREATED,
            timeTableResponseDto(newTimetable)
        );

    } catch (error) {
        console.error("Error creating timetable:", error);
        return errorResponse(res, "Failed to create timetable", HTTP_STATUS.SERVER_ERROR);
    }
};

// @desc Update a timetable
// @route PUT /api/timetable/update/:id
export const updateTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, groupName, isPublished } = req.body;

        const timetable = await Timetable.findById(id);

        if(!timetable){
            return errorResponse(res, "Timetable not found", HTTP_STATUS.NOT_FOUND);
        }

        // Update fields if provided
        if(title !== undefined) {
            timetable.title = title;
        }

        if(description !== undefined) {
            timetable.description = description;
        }

        if(groupName !== undefined) {
            timetable.groupName = groupName;
        }

        if(isPublished !== undefined) {
            timetable.isPublished = isPublished;
        }

        await timetable.save();

        return successResponse(
            res, 
            "Timetable updated successfully", 
            HTTP_STATUS.OK, 
            timeTableResponseDto(timetable)
        );

    } catch (error) {
        console.error("Error updating timetable:", error);
        return errorResponse(res, "Server error occurred while updating timetable", HTTP_STATUS.SERVER_ERROR);
    }
}

// @desc Delete a timetable
// @route DELETE /api/timetable/delete/:id
export const deleteTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTimetable = await Timetable.findByIdAndDelete(id);

        if (!deletedTimetable) {
            return errorResponse(res, "Timetable not found", HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(
            res, 
            "Timetable removed successfully", 
            HTTP_STATUS.OK
        );
    } catch (error) {
        console.error("Error deleting timetable:", error);
        return errorResponse(res, "Server error occurred while deleting timetable", HTTP_STATUS.SERVER_ERROR);
    }
};

// @desc Add or update subjects in a timetable
// @route POST /api/timetable/:id/subjects
export const updateTimetableSubjects = async (req, res) => {
    try {
        const { id } = req.params;
        const { subjectIds } = req.body;

        if (!Array.isArray(subjectIds)) {
            return errorResponse(res, "Subject IDs must be provided as an array", HTTP_STATUS.BAD_REQUEST);
        }

        const timetable = await Timetable.findById(id);
        if (!timetable) {
            return errorResponse(res, "Timetable not found", HTTP_STATUS.NOT_FOUND);
        }

        // Update the timetable with the provided subject IDs
        timetable.subjects = subjectIds;
        await timetable.save();

        return successResponse(
            res, 
            "Subjects updated successfully", 
            HTTP_STATUS.OK,
            { timetableId: id, subjects: timetable.subjects }
        );
    } catch (error) {
        console.error("Error updating timetable subjects:", error);
        return errorResponse(res, "Server error occurred while updating timetable subjects", HTTP_STATUS.SERVER_ERROR);
    }
};

// @desc Add a schedule entry to a timetable
// @route POST /api/timetable/:id/schedule
export const addScheduleEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { subjectId, day, startTime, endTime, venue } = req.body;

        // Validate required fields
        if (!subjectId || !day || !startTime || !endTime) {
            return errorResponse(res, "Subject ID, day, start time, and end time are required", HTTP_STATUS.BAD_REQUEST);
        }

        // Validate day of week
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!validDays.includes(day)) {
            return errorResponse(res, "Invalid day of week", HTTP_STATUS.BAD_REQUEST);
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return errorResponse(res, "Time must be in HH:MM format", HTTP_STATUS.BAD_REQUEST);
        }

        const timetable = await Timetable.findById(id);
        if (!timetable) {
            return errorResponse(res, "Timetable not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check if the subject is part of this timetable
        if (!timetable.subjects.includes(subjectId)) {
            return errorResponse(res, "Subject is not part of this timetable", HTTP_STATUS.BAD_REQUEST);
        }

        // Create the new schedule entry
        const newEntry = {
            subjectId,
            day,
            startTime,
            endTime,
            venue
        };

        // Add to schedule array
        timetable.schedule.push(newEntry);
        await timetable.save();

        // Return the newly created entry
        const createdEntry = timetable.schedule[timetable.schedule.length - 1];

        return successResponse(
            res, 
            "Schedule entry added successfully", 
            HTTP_STATUS.CREATED, 
            createdEntry
        );
    } catch (error) {
        console.error("Error adding schedule entry:", error);
        return errorResponse(res, "Server error occurred while adding schedule entry", HTTP_STATUS.SERVER_ERROR);
    }
};

// @desc Get timetable content (subjects and schedule)
// @route GET /api/timetable/:id/content
export const getTimetableContent = async (req, res) => {
    try {
        const { id } = req.params;
        
        const timetable = await Timetable.findById(id)
            .populate('subjects', 'name code credits lecturer');
            
        if (!timetable) {
            return errorResponse(res, "Timetable not found", HTTP_STATUS.NOT_FOUND);
        }

        const content = {
            timetableId: timetable._id,
            subjects: timetable.subjects.map(subject => subject._id),
            schedule: timetable.schedule
        };

        return successResponse(
            res, 
            "Timetable content fetched successfully", 
            HTTP_STATUS.OK,
            content
        );
    } catch (error) {
        console.error("Error fetching timetable content:", error);
        return errorResponse(res, "Server error occurred while fetching timetable content", HTTP_STATUS.SERVER_ERROR);
    }
};

// @desc Delete a schedule entry from a timetable
// @route DELETE /api/timetable/:id/schedule/:entryId
export const deleteScheduleEntry = async (req, res) => {
    try {
        const { id, entryId } = req.params;
        
        const timetable = await Timetable.findById(id);
        if (!timetable) {
            return errorResponse(res, "Timetable not found", HTTP_STATUS.NOT_FOUND);
        }

        // Find and remove the schedule entry
        const entryIndex = timetable.schedule.findIndex(entry => entry._id.toString() === entryId);
        if (entryIndex === -1) {
            return errorResponse(res, "Schedule entry not found", HTTP_STATUS.NOT_FOUND);
        }

        timetable.schedule.splice(entryIndex, 1);
        await timetable.save();

        return successResponse(
            res, 
            "Schedule entry deleted successfully", 
            HTTP_STATUS.OK
        );
    } catch (error) {
        console.error("Error deleting schedule entry:", error);
        return errorResponse(res, "Server error occurred while deleting schedule entry", HTTP_STATUS.SERVER_ERROR);
    }
};