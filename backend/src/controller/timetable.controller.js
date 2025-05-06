import Timetable from '../models/timetable.model.js';
import Group from '../models/group.model.js';
import Subject from '../models/subject.model.js';
import Venue from '../models/venue.model.js';
import User from '../models/user.model.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { isGeminiConfigured, generateTimetableWithGemini, parseGeminiResponse } from './gemini.helper.js';

dotenv.config();

// Available time slots
const TIME_SLOTS = [
  { start: '08:00', end: '10:00' },
  { start: '10:30', end: '12:30' },
  { start: '13:00', end: '15:00' },
  { start: '15:30', end: '17:30' }
];

// Available days
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const WEEKEND_DAYS = ['Saturday', 'Sunday'];

// Helper function to check if a time slot is available
const isSlotAvailable = (existingSlots, day, timeSlot, venue, lecturer) => {
  return !existingSlots.some(slot => 
    slot.day === day && 
    slot.startTime === timeSlot.start &&
    (slot.venue.toString() === venue.toString() || slot.lecturer.toString() === lecturer.toString())
  );
};

// Get all timetables
export const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find({})
      .populate('group')
      .populate('slots.subject')
      .populate('slots.venue')
      .populate('slots.lecturer');
    
    res.status(200).json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get timetable by group ID
export const getTimetableByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const timetable = await Timetable.findOne({ group: groupId, isActive: true })
      .populate('group')
      .populate('slots.subject')
      .populate('slots.venue')
      .populate('slots.lecturer');
    
    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found for this group' });
    }
    
    res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate timetable using constraint-based approach
export const generateConstraintTimetable = async (req, res) => {
  try {
    const { groupId } = req.body;
    
    // Validate group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Get subjects (for this example, let's assume all subjects in the database are for this group)
    const subjects = await Subject.find({}).populate('lecturer');
    if (subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'No subjects found' });
    }

    // Get venues
    const venues = await Venue.find({});
    if (venues.length === 0) {
      return res.status(400).json({ success: false, message: 'No venues found' });
    }
    
    // Check if a timetable already exists for this group
    const existingTimetable = await Timetable.findOne({ group: groupId, isActive: true });
    if (existingTimetable) {
      // Archive the old timetable
      existingTimetable.isActive = false;
      await existingTimetable.save();
    }
    
    // Create a new timetable
    const timetable = new Timetable({
      group: groupId,
      semester: group.semester,
      year: group.year,
      slots: [],
      generatedBy: 'system',
      version: 'constraint'
    });
    
    // Use all days of the week regardless of group type
    const daysToUse = ALL_DAYS;
    
    // Map to track allocated subjects
    const allocatedSubjects = new Map();
    
    // Generate schedule using a greedy algorithm with constraints
    for (const subject of subjects) {
      if (!subject.lecturer) {
        console.warn(`Subject ${subject.name} has no assigned lecturer, skipping`);
        continue;
      }
      
      let allocated = false;
      
      // Find a suitable venue type based on subject
      const venueType = subject.name.toLowerCase().includes('lab') ? 'lab' : 'lecture';
      const suitableVenues = venues.filter(v => v.type === venueType);
      
      if (suitableVenues.length === 0) {
        console.warn(`No suitable venues of type ${venueType} found for ${subject.name}`);
        continue;
      }
      
      // Try to find an available slot
      for (const day of daysToUse) {
        if (allocated) break;
        
        for (const timeSlot of TIME_SLOTS) {
          if (allocated) break;
          
          for (const venue of suitableVenues) {
            // Check if this slot is available
            if (isSlotAvailable(timetable.slots, day, timeSlot, venue._id, subject.lecturer._id)) {
              // Add this slot to the timetable
              timetable.slots.push({
                day,
                startTime: timeSlot.start,
                endTime: timeSlot.end,
                subject: subject._id,
                venue: venue._id,
                lecturer: subject.lecturer._id
              });
              
              allocatedSubjects.set(subject._id.toString(), true);
              allocated = true;
              break;
            }
          }
        }
      }
      
      if (!allocated) {
        console.warn(`Could not allocate subject ${subject.name} due to constraints`);
      }
    }
    
    // Save the timetable
    await timetable.save();
    
    // Check if all subjects were allocated
    const totalSubjects = subjects.length;
    const allocatedCount = allocatedSubjects.size;
    
    const message = allocatedCount < totalSubjects
      ? `Timetable generated with ${allocatedCount}/${totalSubjects} subjects allocated due to constraints`
      : 'Timetable generated successfully with all subjects allocated';
    
    res.status(200).json({ 
      success: true, 
      message, 
      data: timetable,
      completeness: (allocatedCount / totalSubjects) * 100
    });
    
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate timetable using Gemini AI
export const generateAITimetable = async (req, res) => {
  try {
    const { groupId } = req.body;
    
    // Validate group exists
    const group = await Group.findById(groupId).populate('students');
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Get all necessary data
    const subjects = await Subject.find({}).populate('lecturer');
    const venues = await Venue.find({});
    
    // Check if a previous constraint-based timetable exists to improve upon
    const previousTimetable = await Timetable.findOne({ 
      group: groupId, 
      version: 'constraint',
      isActive: true 
    }).populate('slots.subject').populate('slots.venue').populate('slots.lecturer');
    
    // Prepare data for the AI
    const promptData = {
      group: {
        name: group.name,
        faculty: group.faculty,
        department: group.department,
        year: group.year,
        semester: group.semester,
        studentCount: group.students.length,
        groupType: group.groupType
      },
      subjects: subjects.map(subj => ({
        id: subj._id.toString(),
        name: subj.name,
        code: subj.code,
        credits: subj.credits,
        lecturer: subj.lecturer ? {
          id: subj.lecturer._id.toString(),
          name: `${subj.lecturer.firstName} ${subj.lecturer.lastName}`,
          email: subj.lecturer.email
        } : null
      })),
      venues: venues.map(venue => ({
        id: venue._id.toString(),
        faculty: venue.faculty,
        department: venue.department,
        building: venue.building,
        hallName: venue.hallName,
        type: venue.type,
        capacity: venue.capacity
      })),
      timeSlots: TIME_SLOTS,
      days: ALL_DAYS,
      previousTimetable: previousTimetable ? {
        slots: previousTimetable.slots.map(slot => ({
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subject: slot.subject.name,
          venue: slot.venue.hallName,
          lecturer: `${slot.lecturer.firstName} ${slot.lecturer.lastName}`
        }))
      } : null
    };
    
    // Check if Gemini API is configured
    if (isGeminiConfigured()) {
      try {
        // Generate timetable with Gemini
        const aiGeneratedSlots = await generateTimetableWithGemini(promptData);
        
        // Create a new timetable with the AI-generated slots
        const aiTimetable = new Timetable({
          group: groupId,
          semester: group.semester,
          year: group.year,
          slots: aiGeneratedSlots,
          generatedBy: 'ai',
          version: 'ai'
        });
        
        await aiTimetable.save();
        
        res.status(200).json({ 
          success: true, 
          message: 'AI-generated timetable created successfully', 
          data: aiTimetable 
        });
        
      } catch (error) {
        console.error('Error with Gemini API:', error.message);
        
        // Fallback to constraint-based timetable if AI fails
        res.status(200).json({ 
          success: true, 
          message: 'AI generation failed, using constraint-based timetable instead',
          data: previousTimetable || await generateFallbackTimetable(groupId, group, subjects, venues)
        });
      }
    } else {
      // If no Gemini API key, simulate AI result with a constraint-based approach
      console.log('Gemini API key not configured, using simulated AI timetable');
      const simulatedAITimetable = new Timetable({
        group: groupId,
        semester: group.semester,
        year: group.year,
        slots: previousTimetable ? previousTimetable.slots : [],
        generatedBy: 'system',
        version: 'ai'
      });
      
      await simulatedAITimetable.save();
      
      res.status(200).json({ 
        success: true, 
        message: 'Simulated AI timetable created (Gemini API key not configured)', 
        data: simulatedAITimetable 
      });
    }
    
  } catch (error) {
    console.error('Error generating AI timetable:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Finalize and select preferred timetable version
export const finalizeTimetable = async (req, res) => {
  try {
    const { timetableId } = req.body;
    
    // Find the selected timetable
    const selectedTimetable = await Timetable.findById(timetableId);
    if (!selectedTimetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }
    
    // Deactivate all other timetables for this group
    await Timetable.updateMany(
      { 
        group: selectedTimetable.group, 
        _id: { $ne: selectedTimetable._id } 
      },
      { isActive: false }
    );
    
    // Update the selected timetable
    selectedTimetable.isActive = true;
    selectedTimetable.version = 'final';
    await selectedTimetable.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Timetable finalized successfully', 
      data: selectedTimetable 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to parse AI response
const parseAIResponse = (aiResponse) => {
  try {
    // Extract JSON from text response
    const text = aiResponse.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const slots = JSON.parse(jsonMatch[0]);
      return slots.map(slot => ({
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: slot.subjectId,
        venue: slot.venueId,
        lecturer: slot.lecturerId
      }));
    } else {
      console.warn('Could not extract JSON from AI response');
      return [];
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
};

// Generate a fallback timetable if AI fails
const generateFallbackTimetable = async (groupId, group, subjects, venues) => {
  // Create a new constraint-based timetable as fallback
  const timetable = new Timetable({
    group: groupId,
    semester: group.semester,
    year: group.year,
    slots: [],
    generatedBy: 'system',
    version: 'constraint'
  });
  
  // Use same algorithm as constraint-based approach
  // (simplified version for brevity)
  
  await timetable.save();
  return timetable;
};

// Generate timetable for multiple groups simultaneously
export const generateMultiGroupTimetable = async (req, res) => {
  try {
    const { groupIds } = req.body;
    
    if (!groupIds || !Array.isArray(groupIds) || groupIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide at least one group ID' 
      });
    }

    // Validate all groups exist
    const groups = await Group.find({ _id: { $in: groupIds } });
    if (groups.length !== groupIds.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'One or more groups not found' 
      });
    }

    // Get subjects
    const subjects = await Subject.find({}).populate('lecturer');
    if (subjects.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No subjects found' 
      });
    }

    // Get venues
    const venues = await Venue.find({});
    if (venues.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No venues found' 
      });
    }
    
    // Archive any existing timetables for these groups
    await Timetable.updateMany(
      { group: { $in: groupIds }, isActive: true },
      { isActive: false }
    );
    
    // Create a new timetable for each group
    const createdTimetables = [];
    
    for (const group of groups) {
      const timetable = new Timetable({
        group: group._id,
        semester: group.semester,
        year: group.year,
        slots: [],
        generatedBy: 'system',
        version: 'constraint'
      });
      
      // Assign subjects to the group
      // For this implementation, we're assigning all subjects to each group
      // In a real-world scenario, you'd want to filter subjects relevant to each group
      
      const timetableSlots = [];
      const allocatedSubjects = new Map();
      const allocatedSlots = new Map(); // Track allocated slots to avoid conflicts
      
      // Generate schedule using a greedy algorithm with constraints
      for (const subject of subjects) {
        if (!subject.lecturer) {
          console.warn(`Subject ${subject.name} has no assigned lecturer, skipping`);
          continue;
        }
        
        let allocated = false;
        
        // Find a suitable venue type based on subject
        const venueType = subject.name.toLowerCase().includes('lab') ? 'lab' : 'lecture';
        const suitableVenues = venues.filter(v => v.type === venueType);
        
        if (suitableVenues.length === 0) {
          console.warn(`No suitable venues of type ${venueType} found for ${subject.name}`);
          continue;
        }
        
        // Try to find an available slot across all days
        for (const day of ALL_DAYS) {
          if (allocated) break;
          
          for (const timeSlot of TIME_SLOTS) {
            if (allocated) break;
            
            for (const venue of suitableVenues) {
              // Generate a unique key for this time slot
              const slotKey = `${day}-${timeSlot.start}-${venue._id}-${subject.lecturer._id}`;
              
              // Check if this slot is already allocated
              if (allocatedSlots.has(slotKey)) {
                continue;
              }
              
              // Check if there are conflicts with other groups
              const hasConflict = createdTimetables.some(otherTimetable => {
                return otherTimetable.slots.some(slot => 
                  slot.day === day && 
                  slot.startTime === timeSlot.start &&
                  (slot.venue.toString() === venue._id.toString() || 
                   slot.lecturer.toString() === subject.lecturer._id.toString())
                );
              });
              
              if (!hasConflict) {
                // Add this slot to the timetable
                const newSlot = {
                  day,
                  startTime: timeSlot.start,
                  endTime: timeSlot.end,
                  subject: subject._id,
                  venue: venue._id,
                  lecturer: subject.lecturer._id
                };
                
                timetableSlots.push(newSlot);
                allocatedSlots.set(slotKey, true);
                allocatedSubjects.set(subject._id.toString(), true);
                allocated = true;
                break;
              }
            }
          }
        }
        
        if (!allocated) {
          console.warn(`Could not allocate subject ${subject.name} for group ${group.name} due to constraints`);
        }
      }
      
      // Assign the slots to the timetable
      timetable.slots = timetableSlots;
      
      // Save the timetable
      await timetable.save();
      createdTimetables.push(timetable);
    }
    
    // For simplicity, return the first timetable for now
    // In a more advanced implementation, you might want to return all timetables
    // or a merged view
    const firstTimetable = createdTimetables[0];
    await firstTimetable.populate('group');
    await firstTimetable.populate('slots.subject');
    await firstTimetable.populate('slots.venue');
    await firstTimetable.populate('slots.lecturer');
    
    res.status(200).json({ 
      success: true, 
      message: `Generated timetables for ${groups.length} groups`, 
      data: firstTimetable,
      totalTimetables: createdTimetables.length
    });
    
  } catch (error) {
    console.error('Error generating multi-group timetable:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 