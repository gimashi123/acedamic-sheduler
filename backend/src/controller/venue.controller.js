// controller/venue.controller.js

import Venue from '../models/venue.model.js';
import {
  errorResponse,
  successResponse,
  HTTP_STATUS,
} from '../config/http.config.js';
import { VenueOptionsDTO, venueResponseDto } from '../dto/venue.dto.js';

/**
 * @desc Create a new Venue
 * @route POST /venues
 */
export const createVenue = async (req, res) => {
  try {
    const { department, building, hallName, type, capacity } = req.body;

    // basic validation
    if (!department || !building || !hallName || !type || capacity == null) {
      return errorResponse(
        res,
        'All fields (department, building, hallName, type, capacity) are required',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (capacity < 1) {
      return errorResponse(
        res,
        'Capacity must be at least 1',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const newVenue = new Venue({
      department,
      building,
      hallName,
      type,
      capacity,
    });

    await newVenue.save();

    return successResponse(
      res,
      'Venue created successfully',
      HTTP_STATUS.CREATED,
      venueResponseDto(newVenue),
    );
  } catch (err) {
    console.error('Error creating venue:', err);
    return errorResponse(
      res,
      'Server error occurred while creating venue',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

/**
 * @desc Get all Venues
 * @route GET /venues
 */
export const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find();

    if (!venues.length) {
      return errorResponse(res, 'No venues found', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(
      res,
      'Venues fetched successfully',
      HTTP_STATUS.OK,
      venues.map(venueResponseDto),
    );
  } catch (err) {
    console.error('Error fetching venues:', err);
    return errorResponse(
      res,
      'Server error occurred while fetching venues',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

/**
 * @desc Get a Venue by ID
 * @route GET /venues/:id
 */
export const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findById(id);

    if (!venue) {
      return errorResponse(res, 'Venue not found', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(
      res,
      'Venue fetched successfully',
      HTTP_STATUS.OK,
      venueResponseDto(venue),
    );
  } catch (err) {
    console.error('Error fetching venue:', err);
    return errorResponse(
      res,
      'Server error occurred while fetching venue',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

/**
 * @desc Update a Venue
 * @route PUT /venues/:id
 */
export const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = (({ department, building, hallName, type, capacity }) => ({
      department,
      building,
      hallName,
      type,
      capacity,
    }))(req.body);

    if (updates.capacity != null && updates.capacity < 1) {
      return errorResponse(
        res,
        'Capacity must be at least 1',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const venue = await Venue.findByIdAndUpdate(id, updates, { new: true });

    if (!venue) {
      return errorResponse(res, 'Venue not found', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(
      res,
      'Venue updated successfully',
      HTTP_STATUS.OK,
      venueResponseDto(venue),
    );
  } catch (err) {
    console.error('Error updating venue:', err);
    return errorResponse(
      res,
      'Server error occurred while updating venue',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

/**
 * @desc Delete a Venue
 * @route DELETE /venues/:id
 */
export const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findByIdAndDelete(id);

    if (!venue) {
      return errorResponse(res, 'Venue not found', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(res, 'Venue deleted successfully', HTTP_STATUS.OK);
  } catch (err) {
    console.error('Error deleting venue:', err);
    return errorResponse(
      res,
      'Server error occurred while deleting venue',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

export const getVenuesOptions = async (req, res) => {
  try {
    const venues = await Venue.find();

    if (!venues.length) {
      return errorResponse(res, 'No venues found', HTTP_STATUS.OK);
    }
    return successResponse(
      res,
      'Venues fetched successfully',
      HTTP_STATUS.OK,
      venues.map(VenueOptionsDTO),
    );
  } catch (err) {
    console.error('Error fetching venue options:', err);
    return errorResponse(
      null,
      'Server error occurred while fetching venue options',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};
