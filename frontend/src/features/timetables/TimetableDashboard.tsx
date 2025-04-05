import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableService from '../../services/TimetableService';
import useAuthStore from '../../store/authStore';

const TimetableDashboard: React.FC = () => {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [forceRegenerate, setForceRegenerate] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
    text: '',
    type: '',
  });
  const [generationErrors, setGenerationErrors] = useState<{groupId: string, name: string, reason: string}[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';
  const navigate = useNavigate();

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      setIsLoading(true);
      const response = await TimetableService.getAllTimetables();
      setTimetables(response.data || []);
    } catch (error) {
      setMessage({
        text: 'Failed to load timetables',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAllTimetables = async () => {
    try {
      setIsGenerating(true);
      setMessage({ text: '', type: '' });
      setGenerationErrors([]);
      
      const response = await TimetableService.generateAllTimetables(month, year, forceRegenerate);
      
      if (response.data.failed && response.data.failed.length > 0) {
        setGenerationErrors(response.data.failed);
      }
      
      setMessage({
        text: `Timetables generated successfully. Success: ${response.data.success.length}, Failed: ${response.data.failed.length}`,
        type: 'success',
      });
      
      // Refresh the timetable list
      fetchTimetables();
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to generate timetables',
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTimetable = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) {
      return;
    }
    
    try {
      await TimetableService.deleteTimetable(id);
      setMessage({
        text: 'Timetable deleted successfully',
        type: 'success',
      });
      
      // Refresh the timetable list
      fetchTimetables();
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to delete timetable',
        type: 'error',
      });
    }
  };

  const handlePublishTimetable = async (id: string) => {
    try {
      await TimetableService.updateTimetableStatus(id, 'published');
      setMessage({
        text: 'Timetable published successfully',
        type: 'success',
      });
      
      // Refresh the timetable list
      fetchTimetables();
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to publish timetable',
        type: 'error',
      });
    }
  };

  const viewTimetable = (id: string) => {
    navigate(`/timetables/${id}`);
  };

  // Function to get month name
  const getMonthName = (monthNumber: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Timetable Management</h1>
      
      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold mb-4">Generate Timetables</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min={2023}
                max={2030}
              />
            </div>
            <div className="flex-1 self-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
                onClick={handleGenerateAllTimetables}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate All Timetables'}
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="forceRegenerate"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={forceRegenerate}
                onChange={(e) => setForceRegenerate(e.target.checked)}
              />
              <label htmlFor="forceRegenerate" className="ml-2 text-sm text-gray-700">
                Replace existing timetables (this will delete and regenerate if timetables already exist)
              </label>
            </div>
          </div>
          
          {message.text && (
            <div
              className={`p-3 rounded ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}
          
          {generationErrors.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-red-600 mb-2">Failed Timetable Generation Details:</h3>
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <ul className="text-sm text-red-700 list-disc pl-5">
                  {generationErrors.map((error, index) => (
                    <li key={index}>
                      <strong>{error.name}:</strong> {error.reason}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                These errors may occur due to scheduling conflicts. Try again with "Replace existing timetables" 
                option checked to reassign all schedules.
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Timetables</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : timetables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No timetables found. Generate timetables to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Group</th>
                  <th className="px-4 py-2 text-left">Month/Year</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Generated At</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timetables.map((timetable) => (
                  <tr key={timetable._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{timetable.group.name}</td>
                    <td className="px-4 py-3">
                      {getMonthName(timetable.month)} {timetable.year}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          timetable.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {timetable.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(timetable.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => viewTimetable(timetable._id)}
                        >
                          View
                        </button>
                        
                        {isAdmin && (
                          <>
                            {timetable.status === 'draft' && (
                              <button
                                className="text-green-600 hover:text-green-800"
                                onClick={() => handlePublishTimetable(timetable._id)}
                              >
                                Publish
                              </button>
                            )}
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteTimetable(timetable._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableDashboard; 