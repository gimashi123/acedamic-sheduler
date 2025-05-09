import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectById, updateSubject } from '@/services/subject.service.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';

export function EditSubject() {
  const { id } = useParams(); // Get subject ID from URL
  const navigate = useNavigate();

  const [subject, setSubject] = useState({
    name: '',
    code: '',
    credits: '',
  });

  // Fetch subject details when component loads
  useEffect(() => {
    async function fetchSubject() {
      try {
        const data = await getSubjectById(id);
        setSubject(data);
      } catch (error) {
        console.error('Error fetching subject:', error);
      }
    }
    fetchSubject();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setSubject({ ...subject, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSubject(id, subject);
      alert('Subject updated successfully!');
      navigate('/admin/dashboard/subject'); // Redirect to subject list
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('Failed to update subject');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Edit Subject</h2>
      <form onSubmit={handleSubmit}>
        <label>Subject Name:</label>
        <Input
          name="name"
          value={subject.name}
          onChange={handleChange}
          required
        />

        <label>Module Code:</label>
        <Input
          name="code"
          value={subject.code}
          onChange={handleChange}
          required
        />

        <label>Credits:</label>
        <Input
          name="credits"
          value={subject.credits}
          onChange={handleChange}
          required
        />

        <Button type="submit" className="mt-4 bg-green-600 hover:bg-green-800">
          Update Subject
        </Button>
      </form>
    </div>
  );
}
