export const timeTableResponseDto = (timetable) => ({
  id: timetable._id,
  title: timetable.title,
  description: timetable.description,
  groupName: timetable.groupName,
  isPublished: timetable.isPublished,
  createdAt: timetable.createdAt,
  updatedAt: timetable.updatedAt,
  // now include slots
  slots: timetable.slots.map((slot) => slotResponseDto(slot)),
});

// dto/slot.response.dto.js
export const slotResponseDto = (slot) => {
  return {
    id: slot._id,

    // SUBJECT (assuming it has `name`)
    subject: slot.subject
      ? { id: slot.subject._id, name: slot.subject.name }
      : null,

    // INSTRUCTOR (use the real field, e.g. `fullName` or `username`)
    instructor: slot.instructor
      ? {
          id: slot.instructor._id,
          name:
            slot.instructor.fullName ||
            slot.instructor.username ||
            slot.instructor.email,
        }
      : null,

    // VENUE: use `hallName`, plus whatever else you want
    venue: slot.venue
      ? {
          id: slot.venue._id,
          department: slot.venue.department,
          building: slot.venue.building,
          hallName: slot.venue.hallName,
          type: slot.venue.type,
          capacity: slot.venue.capacity,
        }
      : null,

    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
  };
};
