import Venue from "../models/venue.model.js";

// create venues
export const createVenue = async(req, res) => {
    try {
        const {
            faculty,
            department, 
            building, 
            hallName,
            type,
            capacity
        } = req.body;

        if(!faculty || !department || !building ||!hallName || !type || !capacity) {
            return res.status(400).json({
                message: "All fields are required!"
            });
        }

        const newVenue = new Venue({
            faculty, 
            department, 
            building, 
            hallName, 
            type, 
            capacity
        });

        await newVenue.save();
        
        res.status(201).json({
            message: "Venue added sucecsfully!",
            venue: newVenue
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// fetch all venues
export const getVenues = async(req, res) => {
    try {
        const venues = await Venue.find();
        res.status(200).json(venues);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// fetch a single venue
export const getVenueById = async(req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        
        // validations 
        if(!venue) {
            return res.status(404).json({
                message: "Venue not found!"
            });
        }
        res.status(200).json(venue);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// update venue details 
export const updateVenue = async(req, res) => {
    try {
        const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {new: true});
        
        // validations
        if(!venue) {
            return res.status(404).json({
                message: "Venue not found!"
            });
        }

        if(req.body.capacity && req.body.capacity < 1) {
            return res.status(400).json({
                message: "Capacity must be at least 1!"
            });
        }
        res.status(200).json({
            message: "Venue updated succesfully!"
        }); // make sure to check when testing

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// delete venue details 
export const deleteVenue = async(req, res) => {
    try {
        const venue = await Venue.findByIdAndDelete(req.params.id);

        // validations
        if(!venue) {
            return res.status(404).json({
                message: "Venue not found!"
            });
        }

        res.status(200).json({
            message: "Venue deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// there was a function for showing free venues and occupide venues
// i need to research on this function and for now ill leave it as it is
