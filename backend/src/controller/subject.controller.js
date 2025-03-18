import Subject from '../models/subject.model.js';

// Add a new subject
export const addSubject = async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json({ success: true, message: 'Subject added', subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update subject
export const updateSubject = async (req, res) => {
  try {
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedSubject)
      return res
        .status(404)
        .json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject updated', updatedSubject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete subject
export const deleteSubject = async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
    if (!deletedSubject)
      return res
        .status(404)
        .json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
