import Timetable from '../models/timetable.model.js';
import {errorResponse, HTTP_STATUS, successResponse} from "../config/http.config.js";
import {timeTableResponseDto} from "../dto/timeTable.response.dto.js";
import Group from "../models/group.model.js";
import mongoose from "mongoose";


// @desc Get all timetables
// @route GET /timetables
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
            timetables // Directly return the timetables
        );

    } catch (error) {
        console.error("Error fetching timetables:", error);
        return errorResponse(res, "Failed to fetch timetables", HTTP_STATUS.SERVER_ERROR);
    }
};



// @desc Create a new timetable
// @route POST /timetables
export const createTimetable = async (req, res) => {
    try {
        const { title, description, groupName } = req.body;

        // Validate request
        if (!title || !description || !groupName) {
            return errorResponse(res, "All fields are required", HTTP_STATUS.BAD_REQUEST);
        }

        // Create and save the timetable
        const newTimetable = new Timetable({ title, description, groupName });
        await newTimetable.save();

        return successResponse(
            res,
            "Timetable created successfully",
            HTTP_STATUS.CREATED,
            newTimetable
        );

    } catch (error) {
        console.error("Error creating timetable:", error);
        return errorResponse(res, "Failed to create timetable", HTTP_STATUS.SERVER_ERROR);
    }
};

export const getTimetableById = async (req, res) => {
    try {
        const { id } = req.params;
        const timetable = await Timetable.findById(id);

        if(!timetable){
            return errorResponse(res, "Timetable not found", HTTP_STATUS.BAD_REQUEST);
        }
       return successResponse(res, "Timetable fetched successfully",HTTP_STATUS.OK , timeTableResponseDto(timetable))
    } catch (error) {
        return errorResponse(res, "Server error occurred while fetching timetable", HTTP_STATUS.SERVER_ERROR);
    }
}

// @desc Delete a timetable
// @route DELETE /timetables/:id
export const deleteTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        await Timetable.findByIdAndDelete(id);

        return successResponse(res, "Timetable removed successfully", HTTP_STATUS.OK)
    } catch (error) {
        return errorResponse(res, "Server error occurred while deleting timetable", HTTP_STATUS.SERVER_ERROR);
    }
};


//-------------------------------

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



