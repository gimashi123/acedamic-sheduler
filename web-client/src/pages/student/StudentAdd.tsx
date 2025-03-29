import { useNavigate } from "react-router-dom";
import StudentForm from "@/components/student/StudentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubjectProvider } from "@/context/subject/subject.context";
import { GroupProvider } from "@/context/group/group.context";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function StudentAdd() {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    toast.success("Student added successfully!");
    navigate('/admin/dashboard/student');
  };
  
  return (
    <GroupProvider>
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
            <h2 className="text-2xl font-bold">Add New Student</h2>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <StudentForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </div>
      </SubjectProvider>
    </GroupProvider>
  );
}