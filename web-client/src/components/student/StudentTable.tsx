import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IStudent } from "@/data-types/student.tp";
import { useNavigate } from "react-router-dom";

interface StudentTableProps {
  students: IStudent[];
  onDelete: (id: string) => void;
  onEdit: (student: IStudent) => void;
}

export default function StudentTable({ students, onDelete, onEdit }: StudentTableProps) {
  const [studentToDelete, setStudentToDelete] = useState<IStudent | null>(null);
  const navigate = useNavigate();

  const handleDeleteClick = (student: IStudent) => {
    setStudentToDelete(student);
  };

  const handleViewClick = (id: string) => {
    navigate(`/admin/dashboard/student/${id}`);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete?._id) {
      onDelete(studentToDelete._id);
      setStudentToDelete(null);
    }
  };

  return (
    <>
      <Table className="w-full border">
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Group</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student._id}>
              <TableCell>{student.studentId}</TableCell>
              <TableCell>{student.firstName} {student.lastName}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.degreeProgram}</TableCell>
              <TableCell>{student.groupNumber?.name || "N/A"}</TableCell>
              <TableCell className="flex justify-center space-x-2">
                <Button variant="outline" onClick={() => handleViewClick(student._id)}>
                  View
                </Button>
                <Button variant="outline" onClick={() => onEdit(student)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteClick(student)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {students.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No students found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student?
              <div className="mt-2 space-y-1">
                <p><strong>Student ID:</strong> {studentToDelete?.studentId}</p>
                <p><strong>Name:</strong> {studentToDelete?.firstName} {studentToDelete?.lastName}</p>
                <p><strong>Email:</strong> {studentToDelete?.email}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}