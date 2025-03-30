import Venue from "../models/venue.model.js";

// Get all venues
export const getAllVenues = async (req, res) => {
    try {
        const venues = await Venue.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: venues
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching venues',
            error: error.message
        });
    }
};

// Get a single venue by ID
export const getVenueById = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: venue
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching venue',
            error: error.message
        });
    }
};

// Create a new venue
export const createVenue = async (req, res) => {
    try {
        const { faculty, department, building, hallName, type, capacity } = req.body;
        
        // Check if venue with same name in same building already exists
        const existingVenue = await Venue.findOne({ 
            building, 
            hallName 
        });
        
        if (existingVenue) {
            return res.status(400).json({
                success: false,
                message: 'A venue with this name already exists in this building'
            });
        }
        
        const venue = new Venue({
            faculty,
            department,
            building,
            hallName,
            type,
            capacity,
            bookedSlots: []
        });
        
        await venue.save();
        
        res.status(201).json({
            success: true,
            data: venue,
            message: 'Venue created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating venue',
            error: error.message
        });
    }
};

// Update a venue
export const updateVenue = async (req, res) => {
    try {
        const { faculty, department, building, hallName, type, capacity } = req.body;
        
        // Check if another venue (not this one) has the same name in the same building
        const existingVenue = await Venue.findOne({ 
            building, 
            hallName,
            _id: { $ne: req.params.id } 
        });
        
        if (existingVenue) {
            return res.status(400).json({
                success: false,
                message: 'Another venue with this name already exists in this building'
            });
        }
        
        const updatedVenue = await Venue.findByIdAndUpdate(
            req.params.id,
            { faculty, department, building, hallName, type, capacity },
            { new: true, runValidators: true }
        );
        
        if (!updatedVenue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedVenue,
            message: 'Venue updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating venue',
            error: error.message
        });
    }
};

// Delete a venue
export const deleteVenue = async (req, res) => {
    try {
        const deletedVenue = await Venue.findByIdAndDelete(req.params.id);
        
        if (!deletedVenue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Venue deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting venue',
            error: error.message
        });
    }
};

// there was a function for showing free venues and occupide venues
// i need to research on this function and for now ill leave it as it is
