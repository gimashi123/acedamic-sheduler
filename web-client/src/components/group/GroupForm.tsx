import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface GroupFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function GroupForm({ onSubmit, initialData }: GroupFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      groupName: "",
      faculty: "",
      year: "",
      semester: "",
      type: "",
      students: "",
    },
  });

  return (
    <Card className="w-160 p-6">
      <CardContent className="space-y-4 flex flex-col">
        {/* Group Name */}
        <Label>Group Name</Label>
        <Input {...register("groupName", { required: "Group name is required" })} placeholder="Enter group name" />
        {errors.groupName && <p className="text-red-500 text-sm">{String(errors.groupName.message)}</p>}

        {/* Faculty/Department */}
        <Label>Faculty/Department</Label>
        <Input {...register("faculty", { required: "Faculty is required" })} placeholder="Enter faculty/department" />
        {errors.faculty && <p className="text-red-500 text-sm">{String(errors.faculty.message)}</p>}

        <div className="flex flex-row items-center gap-4">
            <Label>Year</Label>
            <Input type="number" {...register("year", { 
              required: "Year is required", 
              min: { value: 1, message: "Year must be at least 1" }, 
              max: { value: 4, message: "Year cannot be more than 4" } 
            })} placeholder="Year (1-4)"  className="w-30"/>
            {errors.year && <p className="text-red-500 text-sm">{String(errors.year.message)}</p>}

            {/* Semester */}
            <Label>Semester</Label>
            <Select onValueChange={(value) => setValue("semester", value)} value={watch("semester")}>
              <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
              </SelectContent>
            </Select>
            {errors.semester && <p className="text-red-500 text-sm">Semester is required</p>}

            {/* Group Type */}
            <Label>Type</Label>
            <Select onValueChange={(value) => setValue("type", value)} value={watch("type")}>
              <SelectTrigger><SelectValue placeholder="Group Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekday">Weekday</SelectItem>
                <SelectItem value="Weekend">Weekend</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">Group type is required</p>}
        </div>
        {/* Year */}
        

        {/* Registered Students */}
        <Label>Number of Registered Students</Label>
        <Input type="number" {...register("students", { 
          required: "Number of students is required", 
          min: { value: 1, message: "At least 1 student is required" }, 
          max: { value: 60, message: "Maximum 60 students per group" } 
        })} placeholder="Enter number of students (1-60)" />
        {errors.students && <p className="text-red-500 text-sm">{String(errors.students.message)}</p>}

        {/* Submit Button */}
        <Button className="w-full" onClick={handleSubmit(onSubmit)}>Submit</Button>
      </CardContent>
    </Card>
  );
}
