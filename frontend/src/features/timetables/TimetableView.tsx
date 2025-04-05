import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TimetableService, { Timetable, TimeSlot } from '../../services/TimetableService';

const TimetableView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    fetchTimetable(id);
  }, [id]);

  const fetchTimetable = async (timetableId: string) => {
    try {
      setIsLoading(true);
      const response = await TimetableService.getTimetableById(timetableId);
      setTimetable(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load timetable');
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  // Organize time slots by day
  const organizeTimeSlotsByDay = (slots: TimeSlot[]) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlotsByDay: Record<string, TimeSlot[]> = {};
    
    days.forEach(day => {
      timeSlotsByDay[day] = slots.filter(slot => slot.day === day).sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    });
    
    return timeSlotsByDay;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => navigate('/timetables')}
        >
          Back to Timetables
        </button>
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700">Timetable not found</h2>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => navigate('/timetables')}
          >
            Back to Timetables
          </button>
        </div>
      </div>
    );
  }

  const timeSlotsByDay = organizeTimeSlotsByDay(timetable.timeSlots);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Timetable: {timetable.group.name} - {getMonthName(timetable.month)} {timetable.year}
        </h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            timetable.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {timetable.status}
          </span>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => navigate('/timetables')}
          >
            Back to Timetables
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Timetable Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Group: <span className="font-medium text-gray-800">{timetable.group.name}</span></p>
            <p className="text-gray-600">Faculty: <span className="font-medium text-gray-800">{timetable.group.faculty}</span></p>
            <p className="text-gray-600">Department: <span className="font-medium text-gray-800">{timetable.group.department}</span></p>
          </div>
          <div>
            <p className="text-gray-600">Month/Year: <span className="font-medium text-gray-800">{getMonthName(timetable.month)} {timetable.year}</span></p>
            <p className="text-gray-600">Generated At: <span className="font-medium text-gray-800">{new Date(timetable.generatedAt).toLocaleString()}</span></p>
            <p className="text-gray-600">Total Slots: <span className="font-medium text-gray-800">{timetable.timeSlots.length}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Weekly Schedule</h2>
        
        {days.map(day => (
          <div key={day} className="mb-6">
            <h3 className="text-md font-semibold bg-gray-100 p-2 mb-3">{day}</h3>
            
            {timeSlotsByDay[day].length === 0 ? (
              <p className="text-gray-500 italic">No classes scheduled</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-left">Lecturer</th>
                      <th className="px-4 py-2 text-left">Venue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlotsByDay[day].map((slot, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{slot.subject.name}</div>
                          <div className="text-xs text-gray-500">{slot.subject.code}</div>
                        </td>
                        <td className="px-4 py-3">
                          {slot.lecturer.firstName} {slot.lecturer.lastName}
                        </td>
                        <td className="px-4 py-3">
                          <div>{slot.venue.hallName}</div>
                          <div className="text-xs text-gray-500">
                            {slot.venue.building}, {slot.venue.type}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableView; 