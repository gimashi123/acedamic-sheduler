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