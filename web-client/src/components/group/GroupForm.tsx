import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import React, { useState } from "react";
import { addGroup } from "@/services/group.service";
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

interface GroupFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
  onSuccess?: () => void;
}

interface Group {
  _id?: string;
  name: string;
  faculty: string;
  department: string;
  year: number;
  semester: number;
  groupType: "weekday" | "weekend";
  students: string[];
}

export default function GroupForm({ initialData, onSuccess }: GroupFormProps) {
  const [formData, setFormData] = useState<Group>({
    name: "",
    faculty: "",
    department: "",
    year: 0,
    semester: 0,
    groupType: "weekday",
    students: []
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData || {
      name: "",
      faculty: "",
      department: "",
      year: "",
      semester: "",
      groupType: "",
      students: []
    },
  });

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // validation handler - to fill all the fields
  const handleFormSubmit = () => {
    if(!formData.name || !formData.faculty || !formData.department || !formData.year || !formData.semester || !formData.groupType) {
      toast.error("Please fill in all required fields");
      return;
    }
    setShowConfirmation(true);
  };

  // final submission handler
  const handleConfirmSubmit = async() => {
    try {
      setIsSubmitting(true);
      const groupData = {
        name: formData.name,
        faculty: formData.faculty,
        department: formData.department,
        year: Number(formData.year),
        semester: Number(formData.semester),
        groupType: formData.groupType,
        students: []
      };

      await addGroup(groupData);
      toast.success("Group added successfully!");
      reset();
      setFormData({
        name: "",
        faculty: "",
        department: "",
        year: 0,
        semester: 0,
        groupType: "weekday",
        students: []
      });

      if(onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting form: ", error);
      toast.error("Failed to add group, Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <Card className="w-150 p-5">
        <CardContent className="space-y-4 flex flex-col gap-4">

          {/* Group Name */}
          <div className="flex flex-col gap-2">
            <Label>Group Name</Label>
            <Input
              {...register("name", { required: "Group name is required" })}
              placeholder="Enter group name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}
          </div>

          {/* Faculty */}
          <div className="flex flex-col gap-2">
            <Label>Faculty</Label>
            <Input
              {...register("faculty", { required: "Faculty is required" })}
              placeholder="Enter faculty"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
            />
            {errors.faculty && <p className="text-red-500 text-sm">{String(errors.faculty.message)}</p>}
          </div>

          {/* Department */}
          <div className="flex flex-col gap-2">
            <Label>Department</Label>
            <Input
              {...register("department", { required: "Department is required" })}
              placeholder="Enter department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
            {errors.department && <p className="text-red-500 text-sm">{String(errors.department.message)}</p>}
          </div>

          <div className="flex flex-row items-center gap-4">
            
            {/* Year Selection */}
            <div className="flex flex-col gap-2">
              <Label>Year</Label>
              <Select
                onValueChange={(value) => setFormData({ ...formData, year: Number(value) })}
                value={formData.year.toString()}
              >
                <SelectTrigger className="w-40"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
              {errors.year && <p className="text-red-500 text-sm">{String(errors.year.message)}</p>}
            </div>

            {/* Semester Selection */}
            <div className="flex flex-col gap-2">
              <Label>Semester</Label>
              <Select
                onValueChange={(value) => setFormData({ ...formData, semester: Number(value) })}
                value={formData.semester.toString()}
              >
                <SelectTrigger className="w-40"><SelectValue placeholder="Semester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
              {errors.semester && <p className="text-red-500 text-sm">Semester is required</p>}
            </div>

            {/* Group Type Selection */}
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select
                onValueChange={(value) => setFormData({ ...formData, groupType: value as "weekday" | "weekend" })}
                value={formData.groupType}
              >
                <SelectTrigger className="w-40"><SelectValue placeholder="Group Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekday">Weekday</SelectItem>
                  <SelectItem value="weekend">Weekend</SelectItem>
                </SelectContent>
              </Select>
              {errors.groupType && <p className="text-red-500 text-sm">Group type is required</p>}
            </div>
            
          </div>

          {/* Submit Button */}
          <Button 
            className="w-full" 
            onClick={handleSubmit(handleFormSubmit)} 
            disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Group"}
            </Button>
          
        </CardContent>
      </Card>

      {/* Updated confirmation dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Group Addition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add this group?
              <div className="mt-2 space-y-1">
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Faculty:</strong> {formData.faculty}</p>
                <p><strong>Department:</strong> {formData.department}</p>
                <p><strong>Year:</strong> {formData.year}</p>
                <p><strong>Semester:</strong> {formData.semester}</p>
                <p><strong>Type:</strong> {formData.groupType}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Yes, Add"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
