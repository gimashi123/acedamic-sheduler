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
            timetables.map((timetable) => {
                return timeTableResponseDto(timetable);
            })// Directly return the timetables
        );

    } catch (error) {
        console.error("Error fetching timetables:", error);
        return errorResponse(res, "Failed to fetch timetables", HTTP_STATUS.SERVER_ERROR);
    }
};



// @desc Create a new timetable
// @route POST /timetables


/**
 * Controller to create a new timetable
 */
export const createTimetable = async (req, res) => {
    try {
        const { title, description, groupName , isPublished} = req.body;

        // Validate request
        if (!title || !description || !groupName) {
            return errorResponse(res, "All fields are required", HTTP_STATUS.BAD_REQUEST);
        }

        // Create and save the timetable
        const newTimetable = new Timetable({ title, description, groupName ,isPublished });
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
        const { title, description, groupName , isPublished} = req.body;

        const timetable = await Timetable.findById(id);

        if(!timetable){
            errorResponse(res, "Timetable not found", HTTP_STATUS.BAD_REQUEST, null);
        }

        if(title){
            timetable.title = title;
        }

        if(description){
            timetable.description = description;
        }

        if(groupName){
            timetable.groupName = groupName;
        }

        if(isPublished){
            timetable.isPublished = isPublished;
        }


        await timetable.save();

        console.log("timetable updated successfully for id: ", id);

        return successResponse(res, "Timetable updated successfully", HTTP_STATUS.OK, timeTableResponseDto(timetable));

    } catch (error) {

        console.log("Error occured while updating timetable: ", error);
        return errorResponse(res, "Server error occurred while updating timetable", HTTP_STATUS.SERVER_ERROR);
    }
}
