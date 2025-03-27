import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { addStudent, updateStudent } from "@/services/student.service";
import { toast } from "sonner";
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
import { IStudentRequest } from "@/data-types/student.tp";
import { useSubject } from "@/context/subject/subject.context";
import axios from "axios";

interface StudentFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export default function StudentForm({ initialData, onSuccess }: StudentFormProps) {
  const [formData, setFormData] = useState<IStudentRequest>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    degreeProgram: "",
    groupNumber: "",
    subjectsEnrolled: [],
    dateOfBirth: "",
    guardianContact: "",
    address: ""
  });
  
  const [groups, setGroups] = useState<any[]>([]);
  const { subjects } = useSubject();
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch student groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/group');
        if (response.data) {
          setGroups(response.data);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    
    fetchGroups();
  }, []);

  // Set form data if initialData is provided (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        studentId: initialData.studentId || "",
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        degreeProgram: initialData.degreeProgram || "",
        groupNumber: initialData.groupNumber?._id || "",
        subjectsEnrolled: initialData.subjectsEnrolled?.map((s: any) => s._id) || [],
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : "",
        guardianContact: initialData.guardianContact || "",
        address: initialData.address || ""
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Select multiple subjects
  const handleSubjectsChange = (subjectId: string) => {
    setFormData(prev => {
      const isSelected = prev.subjectsEnrolled.includes(subjectId);
      let updatedSubjects;
      
      if (isSelected) {
        updatedSubjects = prev.subjectsEnrolled.filter(id => id !== subjectId);
      } else {
        updatedSubjects = [...prev.subjectsEnrolled, subjectId];
      }
      
      return {
        ...prev,
        subjectsEnrolled: updatedSubjects
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = "First name is required";
    else if (formData.firstName.length < 2) newErrors.firstName = "First name must be at least 2 characters";
    else if (!/^[A-Za-z ]+$/.test(formData.firstName)) newErrors.firstName = "First name can only contain letters";
    
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    else if (formData.lastName.length < 2) newErrors.lastName = "Last name must be at least 2 characters";
    else if (!/^[A-Za-z ]+$/.test(formData.lastName)) newErrors.lastName = "Last name can only contain letters";
    
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) 
      newErrors.email = "Please enter a valid email";
    
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    else if (!/^\d{10,15}$/.test(formData.phoneNumber)) 
      newErrors.phoneNumber = "Phone number must be between 10-15 digits";
    
    if (!formData.degreeProgram) newErrors.degreeProgram = "Degree program is required";
    
    if (!formData.groupNumber) newErrors.groupNumber = "Student group is required";
    
    if (!formData.subjectsEnrolled.length) 
      newErrors.subjectsEnrolled = "At least one subject is required";
    
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) newErrors.dateOfBirth = "Student must be at least 18 years old";
    }
    
    if (formData.guardianContact && !/^\d{10,15}$/.test(formData.guardianContact)) 
      newErrors.guardianContact = "Guardian contact must be between 10-15 digits";
    
    if (formData.address && formData.address.length < 10) 
      newErrors.address = "Address must be at least 10 characters";
    else if (formData.address && formData.address.length > 255) 
      newErrors.address = "Address cannot exceed 255 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (initialData?._id) {
        await updateStudent(initialData._id, formData);
        toast.success("Student updated successfully!");
      } else {
        await addStudent(formData);
        toast.success("Student added successfully!");
      }
      
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        degreeProgram: "",
        groupNumber: "",
        subjectsEnrolled: [],
        dateOfBirth: "",
        guardianContact: "",
        address: ""
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save student. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-3xl p-6">
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student ID - Only shown in edit mode */}
            {initialData && (
              <div className="flex flex-col gap-2">
                <Label>Student ID</Label>
                <Input 
                  value={formData.studentId || "Auto-generated"} 
                  disabled 
                />
              </div>
            )}
            
            {/* First Name */}
            <div className="flex flex-col gap-2">
              <Label>First Name *</Label>
              <Input 
                placeholder="Enter first name" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
            </div>
            
            {/* Last Name */}
            <div className="flex flex-col gap-2">
              <Label>Last Name *</Label>
              <Input 
                placeholder="Enter last name" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
            </div>
            
            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label>Email *</Label>
              <Input 
                placeholder="Enter email" 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            
            {/* Phone Number */}
            <div className="flex flex-col gap-2">
              <Label>Phone Number *</Label>
              <Input 
                placeholder="Enter phone number" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
            </div>
            
            {/* Degree Program */}
            <div className="flex flex-col gap-2">
              <Label>Degree Program *</Label>
              <Select 
                value={formData.degreeProgram}
                onValueChange={(value) => setFormData(prev => ({...prev, degreeProgram: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select degree program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BSc IT">BSc IT</SelectItem>
                  <SelectItem value="BSc CS">BSc CS</SelectItem>
                  <SelectItem value="BSc SE">BSc SE</SelectItem>
                  <SelectItem value="BSc DS">BSc DS</SelectItem>
                  <SelectItem value="BSc IS">BSc IS</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.degreeProgram && <p className="text-red-500 text-sm">{errors.degreeProgram}</p>}
            </div>
            
            {/* Student Group */}
            <div className="flex flex-col gap-2">
              <Label>Student Group *</Label>
              <Select 
                value={formData.groupNumber}
                onValueChange={(value) => setFormData(prev => ({...prev, groupNumber: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.groupNumber && <p className="text-red-500 text-sm">{errors.groupNumber}</p>}
            </div>
            
            {/* Date of Birth */}
            <div className="flex flex-col gap-2">
              <Label>Date of Birth *</Label>
              <Input 
                type="date" 
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
            </div>
            
            {/* Guardian Contact */}
            <div className="flex flex-col gap-2">
              <Label>Guardian Contact (Optional)</Label>
              <Input 
                placeholder="Enter guardian contact" 
                name="guardianContact"
                value={formData.guardianContact}
                onChange={handleChange}
              />
              {errors.guardianContact && <p className="text-red-500 text-sm">{errors.guardianContact}</p>}
            </div>
          </div>
          
          {/* Address */}
          <div className="flex flex-col gap-2">
            <Label>Address (Optional)</Label>
            <Input 
              placeholder="Enter address" 
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>
          
          {/* Subjects Enrolled */}
          <div className="flex flex-col gap-2">
            <Label>Subjects Enrolled *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subjects?.map((subject) => (
                <div key={subject.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`subject-${subject.id}`}
                    checked={formData.subjectsEnrolled.includes(subject.id)}
                    onChange={() => handleSubjectsChange(subject.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor={`subject-${subject.id}`}>
                    {subject.name} ({subject.code})
                  </label>
                </div>
              ))}
            </div>
            {errors.subjectsEnrolled && <p className="text-red-500 text-sm">{errors.subjectsEnrolled}</p>}
          </div>
          
          {/* Submit Button */}
          <Button 
            className="w-full" 
            onClick={handleFormSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : initialData ? "Update Student" : "Add Student"}
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {initialData ? "Confirm Student Update" : "Confirm Student Addition"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {initialData ? "update" : "add"} this student?
              <div className="mt-2 space-y-1">
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Program:</strong> {formData.degreeProgram}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : `Yes, ${initialData ? "Update" : "Add"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}