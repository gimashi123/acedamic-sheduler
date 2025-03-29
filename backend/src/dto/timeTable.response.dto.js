export const timeTableResponseDto = (timetable) => {
    return {
        id: timetable._id,
        title:timetable.title,
        description: timetable.description,
        group: timetable.groupName,
        isPublished: timetable.isPublished,

    };
}


