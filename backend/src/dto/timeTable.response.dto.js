export const timeTableResponseDto = (timetable) => {
    return {
        id: timetable._id,
        course: timetable.course,
        instructor: timetable.instructor,
        day: timetable.day,
        startTime: timetable.startTime,
        endTime: timetable.endTime,
        venue: timetable.venue
    };
}