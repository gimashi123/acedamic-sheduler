import Timetable from '../models/timetable.model.js';
import {errorResponse, HTTP_STATUS, successResponse} from "../config/http.config.js";
import {timeTableResponseDto} from "../dto/timeTable.response.dto.js";
import Group from "../models/group.model.js";
import mongoose from "mongoose";


// @desc Get all timetables
// @route GET /timetables
export const getTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find().populate('group');
        return successResponse(res , "Timetables fetched successfully", HTTP_STATUS.OK, timetables.map(timeTableResponseDto));

    } catch (error) {
        return errorResponse(res, "Failed to fetch timetables", HTTP_STATUS.SERVER_ERROR);
    }
};


// @desc Create a new timetable
// @route POST /timetables
export const createTimetable = async (req, res) => {
    try {
        const { title, description, groupId } = req.body;

        if (!title || !description || !groupId ) {
            return errorResponse(res, "All fields are required", HTTP_STATUS.BAD_REQUEST);
        }

        const selected_group = await Group.findById(groupId);

        if(!selected_group){
            return errorResponse(res, "Group not found", HTTP_STATUS.BAD_REQUEST);
        }

        const newTimetable = new Timetable({ title, description, group: selected_group._id});
        await newTimetable.save();
        return successResponse(
            res,"Timetable created successfully",HTTP_STATUS.CREATED,timeTableResponseDto(newTimetable)
        )
    } catch (error) {
        return errorResponse(
            res,"Failed to create timetable",HTTP_STATUS.SERVER_ERROR
        )
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



