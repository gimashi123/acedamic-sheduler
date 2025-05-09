import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card.tsx';
import { useSubject } from '@/context/subject/subject.context.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash, FileIcon } from 'lucide-react';
import { deleteSubject } from '@/services/subject.service.ts';
import { toast } from 'react-hot-toast';
import { Input } from "@/components/ui/input";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx';
import { ISubject } from '@/data-types/subject.tp.ts';
import { UpdateSubjectDialog } from '@/pages/subject/UpdateSubjectDetailsDialog.tsx';
import { exportToPdf } from '@/utils/pdf-utils.tsx';
import { useState } from 'react';

export function SubjectDashboard() {
  const navigate = useNavigate();
  const { subjects } = useSubject();
  const [searchTerm, setSearchTerm] = useState("");

  console.log(subjects);

  const handleExportToPdf = () => {
    exportToPdf({
      title: `A list of your recent subjects.`,
      filename: `users-${new Date().toISOString().split('T')[0]}`,
      columns: [
        { header: 'Subject Name', dataKey: 'name' },
        { header: 'Module Code', dataKey: 'code' },
        { header: 'Credits', dataKey: 'credits' },
      ],
      data: subjects || [],
    });
    toast.success('PDF exported successfully');
  };

  const filteredSubjects = (subjects || []).filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-row w-full justify-end mb-4 gap-4">
        <Input
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Button
          className="cursor-pointer hover:bg-green-800"
          onClick={() => navigate('/admin/dashboard/subject/add')}
        >
          Add Subject
        </Button>
        <Button onClick={handleExportToPdf} variant="outline" className="gap-2">
          <FileIcon className="h-4 w-4" />
          Export PDF
        </Button>
      </div>
      <Card className={'p-4'}>
        <Table>
          <TableCaption>A list of your recent subjects.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] text-bold text-lg">
                Subject Name
              </TableHead>
              <TableHead className="w-[150px] text-bold text-lg">
                Module Code
              </TableHead>
              <TableHead className="w-[150px] text-bold text-lg">
                Credits
              </TableHead>
              <TableHead className="text-end w-[150px] text-bold text-lg">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubjects?.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.code}</TableCell>
                <TableCell>{subject.credits}</TableCell>
                <TableCell className="text-end">
                  <div className={'space-x-2'}>
                    <UpdateSubjectDialog selectedSubject={subject} />
                    <DeleteSubjectAlert selectedSubject={subject} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

const DeleteSubjectAlert = ({
  selectedSubject,
}: {
  selectedSubject: ISubject;
}) => {
  const { getSubjects } = useSubject();
  const handleDelete = async () => {
    try {
      if (!selectedSubject?.id) return;
      await deleteSubject(selectedSubject.id);
      toast.success('Subject deleted successfully!');
      await getSubjects(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject.');
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={'outline'}
          size={'icon'}
          className={'cursor-pointer hover:text-white hover:bg-red-400'}
        >
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            subject and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
