const bookedSlotDto = (slot) => ({
    date:      slot.date,
    startTime: slot.startTime,
    endTime:   slot.endTime,
});

export const venueResponseDto = (venue) => ({
    id:          venue._id,
    department:  venue.department,
    building:    venue.building,
    hallName:    venue.hallName,
    type:        venue.type,
    capacity:    venue.capacity,
    bookedSlots: Array.isArray(venue.bookedSlots)
        ? venue.bookedSlots.map(bookedSlotDto)
        : [],
    createdAt:   venue.createdAt,
    updatedAt:   venue.updatedAt,
});

export const VenueOptionsDTO = (venue) => ({
    id: venue._id,
    hallName: venue.hallName,
    type: venue.type,
    capacity: venue.capacity
})



