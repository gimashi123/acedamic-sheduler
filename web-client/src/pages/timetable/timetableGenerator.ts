// src/components/timetable/timetableGenerator.ts

import { VenueOptions } from '@/data-types/timetable.tp';
import { SubjectOptions } from '@/data-types/subject.tp';
import { SlotRequest } from '@/data-types/timetable.tp';
import { User } from '@/data-types/user.tp';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
  { startTime: '08:00', endTime: '09:00' },
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '12:00', endTime: '13:00' },
  { startTime: '13:00', endTime: '14:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '17:00' },
  { startTime: '17:00', endTime: '18:00' },
];

const hasConflict = (
  slot: SlotRequest,
  existingSlots: SlotRequest[],
): boolean => {
  return existingSlots.some(
    (existingSlot) =>
      (slot.day === existingSlot.day &&
        slot.startTime === existingSlot.startTime) ||
      (slot.subject === existingSlot.subject &&
        slot.day === existingSlot.day) ||
      (slot.instructor === existingSlot.instructor &&
        slot.day === existingSlot.day) ||
      (slot.venue === existingSlot.venue &&
        slot.day === existingSlot.day &&
        slot.startTime === existingSlot.startTime),
  );
};

const getAvailableResources = (
  usedResources: Set<string>,
  allResources: { id: string }[],
) => {
  return allResources.filter((resource) => !usedResources.has(resource.id));
};

export const generateTimetableSlots = (
  subjects: SubjectOptions[],
  venues: VenueOptions[],
  instructors: User[],
): SlotRequest[] => {
  const generatedSlots: SlotRequest[] = [];

  const dailySubjectUsage = new Map<string, Set<string>>();
  const dailyInstructorUsage = new Map<string, Set<string>>();
  const dailyVenueUsage = new Map<string, Set<string>>();

  days.forEach((day) => {
    dailySubjectUsage.set(day, new Set<string>());
    dailyInstructorUsage.set(day, new Set<string>());
    dailyVenueUsage.set(day, new Set<string>());
  });

  for (const day of days) {
    for (const time of timeSlots) {
      const availableSubjects = getAvailableResources(
        dailySubjectUsage.get(day)!,
        subjects,
      );
      const availableInstructors = getAvailableResources(
        dailyInstructorUsage.get(day)!,
        instructors.map((instructor) => ({ id: instructor._id })),
      );
      const availableVenues = getAvailableResources(
        dailyVenueUsage.get(day)!,
        venues,
      );

      if (
        availableSubjects.length === 0 ||
        availableInstructors.length === 0 ||
        availableVenues.length === 0
      ) {
        continue;
      }

      const subject =
        availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
      const instructor =
        availableInstructors[
          Math.floor(Math.random() * availableInstructors.length)
        ];
      const venue =
        availableVenues[Math.floor(Math.random() * availableVenues.length)];

      const newSlot: SlotRequest = {
        subject: subject.id,
        instructor: instructor.id,  // Use correct instructor ID
        venue: venue.id,
        day,
        startTime: time.startTime,
        endTime: time.endTime,
      };

      if (hasConflict(newSlot, generatedSlots)) {
        continue;
      }

      generatedSlots.push(newSlot);
      dailySubjectUsage.get(day)!.add(subject.id);
      dailyInstructorUsage.get(day)!.add(instructor.id);
      dailyVenueUsage.get(day)!.add(venue.id);
    }
  }

  return generatedSlots;
};

