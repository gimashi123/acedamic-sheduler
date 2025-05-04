import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import {
  getTimetableById,
  addSlotToTimetable,
} from '@/services/timetable.service.ts';
import { useLocation } from 'react-router-dom';
import { SlotRequest, VenueOptions } from '@/data-types/timetable.tp.ts';
import { getVenueOptions } from '@/services/venue.service.ts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { SubjectOptions } from '@/data-types/subject.tp.ts';
import { getSubjectOptions } from '@/services/subject.service.ts';

interface Slot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject?: { id: string; name: string } | null;
  instructor?: { name: string } | null;
  venue?: {
    id: string;
    type: string;
    capacity: number;
    building: string;
    department: string;
    hallName: string;
  } | null;
}

interface Timetable {
  id: string;
  title: string;
  slots: Slot[];
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
];

export const ViewTimeTablePage = () => {
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [venues, setVenues] = useState<VenueOptions[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);

  const [subjects, setSubjects] = useState<SubjectOptions[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [newSlotInfo, setNewSlotInfo] = useState<{
    day: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [formData, setFormData] = useState<SlotRequest>({
    subject: '',
    instructor: '',
    venue: '',
    day: '',
    startTime: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const timetableId = location.state?.timetable?.id || '';

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        if (!timetableId) throw new Error('No timetable ID provided');
        const data = await getTimetableById(timetableId);
        setTimetable(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load timetable',
        );
        toast.error('Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable().then();
  }, [timetableId]);

  const getSlotForDayAndTime = (dayName: string, startTime: string) => {
    return timetable?.slots.find(
      (slot) => slot.day === dayName && slot.startTime === startTime,
    );
  };

  const handleSlotClick = (
    dayName: string,
    time: (typeof timeSlots)[number],
  ) => {
    const existingSlot = getSlotForDayAndTime(dayName, time.start);
    if (existingSlot) {
      setSelectedSlot(existingSlot);
    } else {
      setNewSlotInfo({
        day: dayName,
        startTime: time.start,
        endTime: time.end,
      });
      setFormData({
        subject: '',
        instructor: '',
        venue: '',
        day: dayName,
        startTime: time.start,
        endTime: time.end,
      });
    }
  };

  useEffect(() => {
    const loadVenues = async () => {
      try {
        setLoadingSubjects(true);
        setLoadingVenues(true);
        const venueOptions = await getVenueOptions();
        const subjectsData = await getSubjectOptions();
        setVenues(venueOptions);
        setSubjects(subjectsData);
      } catch (error) {
        toast.error('Failed to load venues');
      } finally {
        setLoadingVenues(false);
        setLoadingSubjects(false);
      }
    };
    loadVenues().then();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!timetableId) throw new Error('No timetable selected');

      const newSlot = await addSlotToTimetable(timetableId, formData);
      if (newSlot) {
        const updatedTimetable = await getTimetableById(timetableId);
        setTimetable(updatedTimetable);
        setNewSlotInfo(null);
      }
    } catch (error) {
      toast.error('Failed to add slot');
      console.error('Error adding slot:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-destructive">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">No timetable found</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{timetable.title}</h1>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Time</TableHead>
              {days.map((day) => (
                <TableHead key={day} className="text-center">
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((time) => (
              <TableRow key={time.start}>
                <TableCell className="font-medium">
                  {time.start} - {time.end}
                </TableCell>
                {days.map((dayName) => {
                  const slot = getSlotForDayAndTime(dayName, time.start);
                  return (
                    <TableCell key={dayName}>
                      <Button
                        variant="outline"
                        className="h-20 w-full flex flex-col items-start justify-center hover:bg-gray-50 transition-colors"
                        onClick={() => handleSlotClick(dayName, time)}
                      >
                        {slot ? (
                          <>
                            <span className="font-medium">
                              {slot.subject?.name || 'No subject'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {slot.instructor?.name || 'No instructor'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {slot.venue?.hallName || 'No venue'}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400">Click to add</span>
                        )}
                      </Button>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Existing Slot Details Dialog */}
      <Dialog
        open={!!selectedSlot}
        onOpenChange={(open) => !open && setSelectedSlot(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slot Details</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Time:</h3>
                <p>
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Day:</h3>
                <p>{selectedSlot.day}</p>
              </div>
              <div>
                <h3 className="font-medium">Subject:</h3>
                <p>{selectedSlot.subject?.name || 'None'}</p>
              </div>
              <div>
                <h3 className="font-medium">Instructor:</h3>
                <p>{selectedSlot.instructor?.name || 'None'}</p>
              </div>
              <div>
                <h3 className="font-medium">Venue:</h3>
                <p>{selectedSlot.venue?.hallName || 'None'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Slot Dialog */}
      <Dialog
        open={!!newSlotInfo}
        onOpenChange={(open) => !open && setNewSlotInfo(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Slot</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="day" className="text-right">
                  Day
                </Label>
                <Input
                  id="day"
                  value={newSlotInfo?.day || ''}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  value={newSlotInfo?.startTime || ''}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  value={newSlotInfo?.endTime || ''}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject
                </Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject: value })
                  }
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingSubjects ? (
                      <div className="p-2 text-center text-sm">
                        Loading subjects...
                      </div>
                    ) : venues.length === 0 ? (
                      <div className="p-2 text-center text-sm">
                        No subjects available
                      </div>
                    ) : (
                      subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructor" className="text-right">
                  Instructor
                </Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="venue" className="text-right">
                  Venue
                </Label>
                <Select
                  value={formData.venue}
                  onValueChange={(value) =>
                    setFormData({ ...formData, venue: value })
                  }
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingVenues ? (
                      <div className="p-2 text-center text-sm">
                        Loading venues...
                      </div>
                    ) : venues.length === 0 ? (
                      <div className="p-2 text-center text-sm">
                        No venues available
                      </div>
                    ) : (
                      venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.hallName} ({venue.type}, Capacity:{' '}
                          {venue.capacity})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Slot</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
