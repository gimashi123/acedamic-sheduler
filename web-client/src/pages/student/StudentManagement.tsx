import { useState, useEffect } from "react";
import StudentForm from "@/components/student/StudentForm";
import StudentTable from "@/components/student/StudentTable";
import { Card, CardContent } from "@/components/ui/card";
import { getAllStudents, deleteStudent } from "@/services/student.service";
import { toast } from "sonner";
import { SubjectProvider } from "@/context/subject/subject.context";
import { IStudent } from "@/data-types/student.tp";

export default function StudentManagement() {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);

  const fetchStudents = async () => {
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleEdit = (student: IStudent) => {
    setEditingStudent(student);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id);
      await fetchStudents();
      toast.success("Student deleted successfully!");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  const handleSuccess = () => {
    fetchStudents();
    setEditingStudent(null);
  };

  return (
    <SubjectProvider>
      <div className="p-4 space-y-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingStudent ? "Update Student" : "Add New Student"}
              </h2>
              <StudentForm 
                initialData={editingStudent} 
                onSuccess={handleSuccess} 
              />
              {editingStudent && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => setEditingStudent(null)}
                    className="text-blue-500 hover:underline"
                  >
                    Cancel Editing
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Student List</h2>
              <StudentTable 
                students={students} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </SubjectProvider>
  );
}