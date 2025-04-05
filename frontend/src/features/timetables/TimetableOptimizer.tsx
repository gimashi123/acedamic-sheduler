import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TimetableService, { Timetable, TimeSlot } from '../../services/TimetableService';
import SubjectService, { Subject } from '../../services/SubjectService';
import VenueService, { Venue } from '../../services/VenueService';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8;
  return `${hour < 10 ? '0' + hour : hour}:00`;
});

const TimetableOptimizer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
    text: '',
    type: '',
  });
  
  // States for manual assignment
  const [manualAssignment, setManualAssignment] = useState({
    subjectId: '',
    venueId: '',
    day: 'Monday',
    startTime: '08:00',
    endTime: '10:00'
  });
  
  // States for time slot filtering
  const [filteredDay, setFilteredDay] = useState<string>('all');
  
  useEffect(() => {
    if (id) {
      loadTimetableData();
      loadSubjects();
      loadVenues();
    }
  }, [id]);
  
  const loadTimetableData = async () => {
    try {
      setIsLoading(true);
      const response = await TimetableService.getTimetableById(id as string);
      setTimetable(response.data);
    } catch (error) {
      setMessage({ text: 'Failed to load timetable', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadSubjects = async () => {
    try {
      const response = await SubjectService.getAllSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };
  
  const loadVenues = async () => {
    try {
      const response = await VenueService.getAllVenues();
      setVenues(response.data);
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  };
  
  const handleLockToggle = async (slotId: string, currentLocked: boolean) => {
    if (!timetable) return;
    
    try {
      await TimetableService.lockTimeSlot(timetable._id as string, slotId, !currentLocked);
      
      // Update local state
      const updatedTimeSlots = timetable.timeSlots.map(slot => {
        if (slot._id === slotId) {
          return { ...slot, isLocked: !currentLocked };
        }
        return slot;
      });
      
      setTimetable({
        ...timetable,
        timeSlots: updatedTimeSlots
      });
      
      setMessage({
        text: `Time slot ${!currentLocked ? 'locked' : 'unlocked'} successfully`,
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: 'Failed to update time slot lock status',
        type: 'error'
      });
    }
  };
  
  const handleOptimize = async () => {
    if (!timetable) return;
    
    try {
      setOptimizing(true);
      setMessage({ text: '', type: '' });
      
      const response = await TimetableService.optimizeTimetable(timetable._id as string);
      
      setTimetable(response.data);
      
      setMessage({
        text: 'Timetable optimized successfully',
        type: 'success'
      });
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to optimize timetable',
        type: 'error'
      });
    } finally {
      setOptimizing(false);
    }
  };
  
  const handleManualAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setManualAssignment(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const calculateEndTime = (startTime: string) => {
    // Get the selected subject
    const selectedSubject = subjects.find(s => s._id === manualAssignment.subjectId);
    if (!selectedSubject) return '10:00';
    
    // Get the duration in minutes (default to 120 if not specified)
    const durationMinutes = selectedSubject.sessionDuration || 120;
    
    // Parse the start time
    const [hours, minutes] = startTime.split(':').map(Number);
    
    // Calculate the end time
    const startTotalMinutes = hours * 60 + minutes;
    const endTotalMinutes = startTotalMinutes + durationMinutes;
    
    // Convert back to HH:MM format
    const endHours = Math.floor(endTotalMinutes / 60);
    const endMinutes = endTotalMinutes % 60;
    
    return `${endHours < 10 ? '0' + endHours : endHours}:${endMinutes < 10 ? '0' + endMinutes : endMinutes}`;
  };
  
  const handleManualAssign = async () => {
    if (!timetable) return;
    
    // Calculate the end time based on subject duration
    const endTime = calculateEndTime(manualAssignment.startTime);
    
    try {
      const response = await TimetableService.assignTimeSlot(
        timetable._id as string,
        manualAssignment.subjectId,
        manualAssignment.venueId,
        manualAssignment.day,
        manualAssignment.startTime,
        endTime
      );
      
      setTimetable(response.data);
      
      setMessage({
        text: 'Time slot assigned successfully',
        type: 'success'
      });
      
      // Reset the form
      setManualAssignment({
        subjectId: '',
        venueId: '',
        day: 'Monday',
        startTime: '08:00',
        endTime: '10:00'
      });
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to assign time slot',
        type: 'error'
      });
    }
  };
  
  const getFilteredTimeSlots = () => {
    if (!timetable) return [];
    
    if (filteredDay === 'all') {
      return timetable.timeSlots;
    }
    
    return timetable.timeSlots.filter(slot => slot.day === filteredDay);
  };
  
  const renderOptimizationScore = () => {
    if (!timetable || !timetable.optimizationScore) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-semibold mb-2">Optimization Score: {timetable.optimizationScore.toFixed(2)}</h3>
        
        {timetable.optimizationDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="font-medium">Gap Score</div>
              <div className="text-lg">{timetable.optimizationDetails.gapScore.toFixed(2)}</div>
              <div className="text-xs text-gray-600">Minimizes gaps between classes</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-md">
              <div className="font-medium">Distribution Score</div>
              <div className="text-lg">{timetable.optimizationDetails.distributionScore.toFixed(2)}</div>
              <div className="text-xs text-gray-600">Even distribution across days</div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-md">
              <div className="font-medium">Preference Score</div>
              <div className="text-lg">{timetable.optimizationDetails.preferenceScore.toFixed(2)}</div>
              <div className="text-xs text-gray-600">Subject & venue preference matching</div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (!timetable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          Timetable not found
        </div>
        <button 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => navigate('/timetables')}
        >
          Back to Timetables
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Timetable Optimizer</h1>
        <button 
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          onClick={() => navigate(`/timetables/${id}`)}
        >
          Back to Timetable View
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {timetable.group?.name} - {new Date(timetable.month + '/01/' + timetable.year).toLocaleString('default', { month: 'long' })} {timetable.year}
          </h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            onClick={handleOptimize}
            disabled={optimizing}
          >
            {optimizing ? 'Optimizing...' : 'Optimize Timetable'}
          </button>
        </div>
        
        {message.text && (
          <div
            className={`p-3 rounded mb-4 ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}
        
        {renderOptimizationScore()}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manual Assignment Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Manually Assign Time Slot</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                name="subjectId"
                value={manualAssignment.subjectId}
                onChange={handleManualAssignmentChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <select
                name="venueId"
                value={manualAssignment.venueId}
                onChange={handleManualAssignmentChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select a venue</option>
                {venues.map(venue => (
                  <option key={venue._id} value={venue._id}>
                    {venue.name} ({venue.capacity} seats)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                name="day"
                value={manualAssignment.day}
                onChange={handleManualAssignmentChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <select
                name="startTime"
                value={manualAssignment.startTime}
                onChange={handleManualAssignmentChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full"
              onClick={handleManualAssign}
              disabled={!manualAssignment.subjectId || !manualAssignment.venueId}
            >
              Assign Time Slot
            </button>
          </div>
        </div>
        
        {/* Time Slots Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Current Time Slots</h2>
            
            <select
              value={filteredDay}
              onChange={(e) => setFilteredDay(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="all">All days</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          
          {getFilteredTimeSlots().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No time slots found for the selected filter.
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day & Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredTimeSlots().map((slot) => (
                    <tr key={slot._id} className={slot.isLocked ? 'bg-yellow-50' : ''}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {slot.subject.code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {slot.subject.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {slot.day}
                        </div>
                        <div className="text-sm text-gray-500">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {slot.venue.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Lecturer: {slot.lecturer.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className={`text-sm px-2 py-1 rounded-md ${
                            slot.isLocked 
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                          onClick={() => handleLockToggle(slot._id as string, slot.isLocked || false)}
                        >
                          {slot.isLocked ? 'Unlock' : 'Lock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetableOptimizer; 