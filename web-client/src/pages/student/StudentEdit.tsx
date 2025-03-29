import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentForm from "@/components/student/StudentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStudentById } from "@/services/student.service";
import { toast } from "sonner";
import { SubjectProvider } from "@/context/subject/subject.context";
import { ArrowLeft } from "lucide-react";

export default function StudentEdit() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await getStudentById(id);
        setStudent(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student:", error);
        setError("Failed to load student details");
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleSuccess = () => {
    navigate('/admin/dashboard/student');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl text-red-500">{error || "Student not found"}</h2>
        <Button className="mt-4" onClick={() => navigate('/admin/dashboard/student')}>
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <SubjectProvider>
      <div className="p-6">
        {/* Back button and page title */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/dashboard/student')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h2 className="text-2xl font-bold">Edit Student</h2>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <StudentForm initialData={student} onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </SubjectProvider>
  );
}