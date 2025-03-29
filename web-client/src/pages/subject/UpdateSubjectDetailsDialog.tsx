import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

import { useEffect, useState, useRef } from 'react';

import { Pencil } from 'lucide-react';
import { ISubject, ISubjectRequest } from '@/data-types/subject.tp.ts';
import { useSubject } from '@/context/subject/subject.context.tsx';
import { updateSubject } from '@/services/subject.service.ts';

export function UpdateSubjectDialog({
  selectedSubject,
}: {
  selectedSubject: ISubject;
}) {
  const { getSubjects } = useSubject();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const [subject, setSubject] = useState<ISubjectRequest>({
    name: '',
    code: '',
    credits: 0,
  });

  useEffect(() => {
    setSubject({
      name: selectedSubject?.name,
      code: selectedSubject?.code,
      credits: Number(selectedSubject?.credits),
    });
  }, [selectedSubject]);

  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await updateSubject(selectedSubject.id, subject);

      toast.success('✅ Subject updated successfully!');

      setIsOpen(false);
      await getSubjects();
    } catch (error) {
      console.error('❌ Error updating subject:', error);
      toast.error('Failed to update subject');
    }
  };

  // Handle input changes
  const handleChange = (e: any) => {
    if (e.target.name == 'credits') {
      setSubject({
        ...subject,
        [e.target.name]: Number(e.target),
      });
    }

    setSubject({ ...subject, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dialogContentRef.current &&
        !dialogContentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          variant={'outline'}
          size={'icon'}
          className={'cursor-pointer hover:text-white hover:bg-green-400'}
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent ref={dialogContentRef} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Time Table Details</DialogTitle>
        </DialogHeader>
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

            <Button
              type="submit"
              className="mt-4 bg-green-600 hover:bg-green-800"
            >
              Update Subject
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
