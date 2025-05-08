import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import {
  timeTableResponseDto,
  slotResponseDto,
} from '../dto/timeTable.response.dto.js';
import Timetable from '../models/timetable.model.js';

// @desc Get all timetables
// @route GET /timetables
export const getTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find();
    if (!timetables || timetables.length === 0) {
      return errorResponse(res, 'No timetables found', HTTP_STATUS.NOT_FOUND);
    }
    return successResponse(
      res,
      'Timetables fetched successfully',
      HTTP_STATUS.OK,
      timetables.map((tt) => timeTableResponseDto(tt)),
    );
  } catch (error) {
    console.error('Error fetching timetables:', error);
    return errorResponse(
      res,
      'Failed to fetch timetables',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

// @desc Create a new timetable
// @route POST /timetables
export const createTimetable = async (req, res) => {
  try {
    const { title, description, groupName, isPublished } = req.body;
    if (!title || !description || !groupName) {
      return errorResponse(
        res,
        'Title, description, and groupName are required',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    const newTimetable = new Timetable({
      title,
      description,
      groupName,
      isPublished,
    });
    await newTimetable.save();
    return successResponse(
      res,
      'Timetable created successfully',
      HTTP_STATUS.CREATED,
      timeTableResponseDto(newTimetable),
    );
  } catch (error) {
    console.error('Error creating timetable:', error);
    return errorResponse(
      res,
      'Failed to create timetable',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

// @desc Get a timetable by ID
// @route GET /timetables/:id
export const getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate the subject, instructor & venue on each slot
    const timetable = await Timetable.findById(id)
      .populate('slots.subject')
      .populate('slots.instructor')
      .populate('slots.venue');

    if (!timetable) {
      return errorResponse(res, 'Timetable not found', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(
      res,
      'Timetable fetched successfully',
      HTTP_STATUS.OK,
      timeTableResponseDto(timetable),
    );
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return errorResponse(
      res,
      'Server error occurred while fetching timetable',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

// @desc Delete a timetable
// @route DELETE /timetables/:id
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    await Timetable.findByIdAndDelete(id);
    return successResponse(
      res,
      'Timetable removed successfully',
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error('Error deleting timetable:', error);
    return errorResponse(
      res,
      'Server error occurred while deleting timetable',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

// @desc Update timetable metadata
// @route PUT /timetables/:id
export const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = (({ title, description, groupName, isPublished }) => ({
      title,
      description,
      groupName,
      isPublished,
    }))(req.body);
    const timetable = await Timetable.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!timetable) {
      return errorResponse(res, 'Timetable not found', HTTP_STATUS.NOT_FOUND);
    }
    return successResponse(
      res,
      'Timetable updated successfully',
      HTTP_STATUS.OK,
      timeTableResponseDto(timetable),
    );
  } catch (error) {
    console.error('Error updating timetable:', error);
    return errorResponse(
      res,
      'Server error occurred while updating timetable',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

// @desc Add a slot to a timetable
// @route POST /timetables/:id/slots
export const addSlotToTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const slotData = req.body;
    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return errorResponse(res, 'Timetable not found', HTTP_STATUS.NOT_FOUND);
    }
    timetable.slots.push(slotData);
    await timetable.save();
    const newSlot = timetable.slots[timetable.slots.length - 1];
    return successResponse(
      res,
      'Slot added successfully',
      HTTP_STATUS.CREATED,
      slotResponseDto(newSlot),
    );
  } catch (error) {
    console.error('Error adding slot:', error);
    return errorResponse(
      res,
      'Server error occurred while adding slot',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

// @desc Update a specific slot in a timetable
// @route PUT /timetables/:id/slots/:slotId
export const updateSlotInTimetable = async (req, res) => {
  try {
    const { id, slotId } = req.params;
    const slotUpdates = req.body;
    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return errorResponse(res, 'Timetable not found', HTTP_STATUS.NOT_FOUND);
    }
    const slot = timetable.slots.id(slotId);
    if (!slot) {
      return errorResponse(res, 'Slot not found', HTTP_STATUS.NOT_FOUND);
    }
    Object.assign(slot, slotUpdates);
    await timetable.save();
    return successResponse(
      res,
      'Slot updated successfully',
      HTTP_STATUS.OK,
      slotResponseDto(slot),
    );
  } catch (error) {
    console.error('Error updating slot:', error);
    return errorResponse(
      res,
      'Server error occurred while updating slot',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

// @desc Delete a slot from a timetable
// @route DELETE /timetables/:id/slots/:slotId
export const deleteSlotFromTimetable = async (req, res) => {
  try {
    const { id, slotId } = req.params;
    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return errorResponse(res, 'Timetable not found', HTTP_STATUS.NOT_FOUND);
    }
    const slot = timetable.slots.id(slotId);
    if (!slot) {
      return errorResponse(res, 'Slot not found', HTTP_STATUS.NOT_FOUND);
    }
    slot.remove();
    await timetable.save();
    return successResponse(res, 'Slot deleted successfully', HTTP_STATUS.OK);
  } catch (error) {
    console.error('Error deleting slot:', error);
    return errorResponse(
      res,
      'Server error occurred while deleting slot',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};
