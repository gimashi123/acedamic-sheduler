import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentById, deleteStudent } from "@/services/student.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import { IStudent } from "@/data-types/student.tp";

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<IStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchStudent(id);
    }
  }, [id]);

  const fetchStudent = async (studentId: string) => {
    try {
      setLoading(true);
      const data = await getStudentById(studentId);
      setStudent(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching student:", error);
      setError("Failed to load student details");
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/dashboard/student/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteStudent(id);
      toast.success("Student deleted successfully");
      navigate("/admin/dashboard/student");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  const goBack = () => {
    navigate("/admin/dashboard/student");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl text-red-500">{error || "Student not found"}</h2>
        <Button className="mt-4" onClick={goBack}>Back to Students</Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Button variant="outline" onClick={goBack} className="mb-4">
        ← Back to Students
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex justify-between items-center">
            <span>Student Details</span>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleEdit}>Edit</Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>Delete</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Student ID:</span>
                  <span>{student.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Full Name:</span>
                  <span>{student.firstName} {student.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span>{student.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date of Birth:</span>
                  <span>{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Academic Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Degree Program:</span>
                  <span>{student.degreeProgram}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Group:</span>
                  <span>{student.groupNumber?.name || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Subjects Enrolled</h3>
            {student.subjectsEnrolled && student.subjectsEnrolled.length > 0 ? (
              <ul className="list-disc pl-5">
                {student.subjectsEnrolled.map((subject, index) => (
                  <li key={index}>{subject.name} ({subject.code})</li>
                ))}
              </ul>
            ) : (
              <p>No subjects enrolled</p>
            )}
          </div>

          {student.address && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              <p>{student.address}</p>
            </div>
          )}

          {student.guardianContact && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Guardian Contact</h3>
              <p>{student.guardianContact}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}