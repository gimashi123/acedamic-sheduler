/**
 * Transforms the timetable document from MongoDB into a frontend-friendly format
 * Renames _id to id and groupName to group for frontend consistency
 * 
 * @param {Object} timetable - The timetable document from MongoDB
 * @returns {Object} - The transformed timetable object
 */
export const timeTableResponseDto = (timetable) => {
  return {
    id: timetable._id,
    title: timetable.title,
    description: timetable.description,
    group: timetable.groupName,
    isPublished: timetable.isPublished,
    createdAt: timetable.createdAt,
    updatedAt: timetable.updatedAt
  };
}; 