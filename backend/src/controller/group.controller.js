import Group from "../models/group.model.js";

// create groups 
export const createGroup = async (req, res) => {
    try {
        const {
            name,
            faculty, 
            department,
            year, 
            semester,
            groupType,
            students
        } = req.body;

        // validations for details 
        if(!name || !faculty || !department || !year || !semester || !groupType) {
            return res.status(400).json({
                message: "All fields are required!"
            });
        };

        // validations for the student-count 
        if(students && students.length > 60) {
            return res.status(400).json({
                message: "A group cannot have more than 60 students!"
            });
        };

        const newGroup = new Group ({
            name,
            faculty,
            department,
            year,
            semester,
            groupType,
            students
        });
        await newGroup.save();

        res.status(201).json({
            message: "Group created successfull!",
            group: newGroup
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// fetch all groups 
export const getGroups = async(req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// fetch a single group
export const getGroupById = async(req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if(!group) {
            return res.status(404).json({
                message: "Group not found!"
            });
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// update a group - need to check what attributes should be leave to updated
export const updateGroup = async(req, res) => {
    try {
         const group = await Group.findByIdAndUpdate(req.params.id, req.body, {new: true});
         if(!group) {
            return res.status(404).json({
                message: "Group not found!"
            });
         }

         if(req.body.students && req.body.students.length > 60) {
            return res.status(400).json({
                message: "Agroup cannot have more than 60 students!"
            });
         }
         res.status(200).json({
            message: "Group updated successfully!"
         });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// delete a group
export const deleteGroup = async(req, res) => {
    try {
        const group =await Group.findByIdAndDelete(req.params.id);
        if(!group) {
            return res.status(404).json({
                message: "Group not found!"
            });
        }
        res.status(200).json({
            message: "Group deleted successfully!"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};