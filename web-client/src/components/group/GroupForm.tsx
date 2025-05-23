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
  existingGroups?: any[]; // Add this prop to receive existing groups
}

interface Group { // removed faculty, semester and groupType fileds
  _id?: string;
  name: string;
  // faculty: string;
  department: string;
  year: number;
  // semester: number;
  // groupType: "weekday" | "weekend";
  students: string[];
}

export default function GroupForm({ initialData, onSuccess, existingGroups = [] }: GroupFormProps) { // removed faculty, semester and groupType fileds
  const [formData, setFormData] = useState<Group>({
    name: "",
    // faculty: "",
    department: "",
    year: 0,
    // semester: 0,
    // groupType: "weekday",
    students: []
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const { // removed faculty, semester and groupType fileds
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData || {
      name: "",
      // faculty: "",
      department: "",
      year: "",
      // semester: "",
      // groupType: "",
      students: []
    },
  });

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Check for duplicate name when name is changed
    if (name === 'name') {
      const isNameExists = existingGroups.some(
        group => group.name.toLowerCase() === value.toLowerCase()
      );
      
      if (isNameExists) {
        setNameError('A group with this name already exists');
      } else {
        setNameError(null);
      }
    }
  };

  // validation handler - to fill all the fields - removed faculty, semester and groupType fileds
  const handleFormSubmit = () => {
    if(!formData.name || !formData.department || !formData.year) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check for duplicate name before showing confirmation
    const isNameExists = existingGroups.some(
      group => group.name.toLowerCase() === formData.name.toLowerCase()
    );
    
    if (isNameExists) {
      setNameError('A group with this name already exists');
      return;
    }

    setShowConfirmation(true);
  };

  // final submission handler - removed faculty, semester and groupType fileds
  const handleConfirmSubmit = async() => {
    try {
      setIsSubmitting(true);
      const groupData = {
        name: formData.name,
        // faculty: formData.faculty,
        department: formData.department,
        year: Number(formData.year),
        // semester: Number(formData.semester),
        // groupType: formData.groupType,
        students: []
      };

      await addGroup(groupData);
      toast.success("Group added successfully!");
      reset();
      setFormData({
        name: "",
        // faculty: "",
        department: "",
        year: 0,
        // semester: 0,
        // groupType: "weekday",
        students: []
      });
      setNameError(null);

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
      <Card className="w-140 p-5"> {/*removed faculty, semester and groupType fileds*/}
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
              className={nameError ? "border-red-500" : "w-115"}
            />
            {errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          </div>

          {/* Faculty */}
          {/* <div className="flex flex-col gap-2">
            <Label>Faculty</Label>
            <Input
              {...register("faculty", { required: "Faculty is required" })}
              placeholder="Enter faculty"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
            />
            {errors.faculty && <p className="text-red-500 text-sm">{String(errors.faculty.message)}</p>}
          </div> */}

          {/* Department */}
          <div className="flex flex-col gap-2">
            <Label>Department</Label>
            <Input
              {...register("department", { required: "Department is required" })}
              placeholder="Enter department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-115"
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
                <SelectTrigger className="w-55"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                </SelectContent>
              </Select>
              {errors.year && <p className="text-red-500 text-sm">{String(errors.year.message)}</p>}
            </div>

            {/* Semester Selection */}
            {/* <div className="flex flex-col gap-2">
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
            </div> */}

            {/* Group Type Selection */}
            {/* <div className="flex flex-col gap-2">
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
            </div> */}
            
          </div>

          {/* Submit Button */}
          <Button 
            className="w-full" 
            onClick={handleSubmit(handleFormSubmit)} 
            disabled={isSubmitting || !!nameError}
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
                {/* <p><strong>Faculty:</strong> {formData.faculty}</p> */}
                <p><strong>Department:</strong> {formData.department}</p>
                <p><strong>Year:</strong> {formData.year}</p>
                {/* <p><strong>Semester:</strong> {formData.semester}</p> */}
                {/* <p><strong>Type:</strong> {formData.groupType}</p> */}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting || !!nameError}>
              {isSubmitting ? "Adding..." : "Yes, Add"}
            </AlertDialogAction>
          </AlertDialogFooter>
          
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
