import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import React, { useState } from "react";
import { addGroup } from "@/services/group.service";

interface GroupFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
}

interface Group {
  _id?: string;
  name: string;
  faculty: string;
  year: number;
  semester: number;
  type: "weekday" | "weekend",
  maxStudent: number;
}

export default function GroupForm({ initialData }: GroupFormProps) {
  const [formData, setFormData] = useState<Group>({
    name: "",
    faculty: "",
    year: 0,
    semester: 0,
    type: "weekday",
    maxStudent: 60,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      name: "",
      faculty: "",
      year: "",
      semester: "",
      type: "",
      maxStudent: "",
    },
  });

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const onSubmit = async () => {
    try {
      await addGroup(formData);
      setFormData({
        name: "",
        faculty: "",
        year: 0,
        semester: 0,
        type: "weekday",
        maxStudent: 60,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
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

        {/* Faculty/Department */}
        <div className="flex flex-col gap-2">
          <Label>Faculty/Department</Label>
          <Input
            {...register("faculty", { required: "Faculty is required" })}
            placeholder="Enter faculty/department"
            name="faculty"
            value={formData.faculty}
            onChange={handleChange}
          />
          {errors.faculty && <p className="text-red-500 text-sm">{String(errors.faculty.message)}</p>}
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
              onValueChange={(value) => setFormData({ ...formData, type: value as "weekday" | "weekend" })}
              value={formData.type}
            >
              <SelectTrigger className="w-40"><SelectValue placeholder="Group Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekday">Weekday</SelectItem>
                <SelectItem value="Weekend">Weekend</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">Group type is required</p>}
          </div>
          
        </div>

        {/* Registered Students */}
        <div className="flex flex-col gap-2">
          <Label>Number of Registered Students</Label>
          <Input
            type="number"
            {...register("maxStudent", { 
              required: "Number of students is required", 
              min: { value: 1, message: "At least 1 student is required" }, 
              max: { value: 60, message: "Maximum 60 students per group" },
            })}
            placeholder="Enter number of students (1-60)"
            name="maxStudent"
            value={formData.maxStudent}
            onChange={handleChange}
          />
          {errors.maxStudent && <p className="text-red-500 text-sm">{String(errors.maxStudent.message)}</p>}
        </div>

        {/* Submit Button */}
        <Button className="w-full" onClick={handleSubmit(onSubmit)}>Submit</Button>
        
      </CardContent>
    </Card>
  );
}
