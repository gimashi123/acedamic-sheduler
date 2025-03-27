import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import StudentTable from "@/components/student/StudentTable";
import { Card, CardContent } from "@/components/ui/card";
import { getAllStudents, deleteStudent } from "@/services/student.service";
import { toast } from "sonner";
import { SubjectProvider } from "@/context/subject/subject.context";
import { IStudent } from "@/data-types/student.tp";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react"; // Import the Plus icon for the button

export default function StudentManagement() {
  const [students, setStudents] = useState<IStudent[]>([]);
  const navigate = useNavigate();

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
    navigate(`/admin/dashboard/student/edit/${student._id}`);
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

  return (
    <SubjectProvider>
      <div className="p-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Student Management</h2>
          <Button 
            onClick={() => navigate('/admin/dashboard/student/add')} 
            className="bg-black hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
        
        {/* Student Table */}
        <Card>
          <CardContent className="pt-6">
            <StudentTable 
              students={students} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </SubjectProvider>
  );
}