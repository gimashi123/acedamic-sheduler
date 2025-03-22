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
    <Card className="w-150 p-5">
      <CardContent className="space-y-4 flex flex-col gap-4">

        {/* Group Name */}
        <div className="flex flex-col gap-2">
          <Label>Group Name</Label>
          <Input {...register("groupName", { required: "Group name is required" })} placeholder="Enter group name" />
          {errors.groupName && <p className="text-red-500 text-sm">{String(errors.groupName.message)}</p>}
        </div>
        

        {/* Faculty/Department */}
        <div className="flex flex-col gap-2">
          <Label>Faculty/Department</Label>
          <Input {...register("faculty", { required: "Faculty is required" })} placeholder="Enter faculty/department" />
          {errors.faculty && <p className="text-red-500 text-sm">{String(errors.faculty.message)}</p>}
        </div>
        

        <div className="flex flex-row items-center gap-4">
          
          {/* year */}
          <div className="flex flex-col gap-2">
            <Label>Year</Label>
            <Select onValueChange={(value) => setValue("year", value)} value={watch("year")}>
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

            {/* Semester */}
            <div className="flex flex-col gap-2">
              <Label>Semester</Label>
              <Select onValueChange={(value) => setValue("semester", value)} value={watch("semester")}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Semester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
              {errors.semester && <p className="text-red-500 text-sm">Semester is required</p>}
            </div>

            {/* Group Type */}
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select onValueChange={(value) => setValue("type", value)} value={watch("type")}>
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
          <Input type="number" {...register("students", { 
            required: "Number of students is required", 
            min: { value: 1, message: "At least 1 student is required" }, 
            max: { value: 60, message: "Maximum 60 students per group" } 
          })} placeholder="Enter number of students (1-60)" />
          {errors.students && <p className="text-red-500 text-sm">{String(errors.students.message)}</p>}
        </div>
        
        {/* Submit Button */}
        <Button className="w-full" onClick={handleSubmit(onSubmit)}>Submit</Button>
      </CardContent>
    </Card>
  );
}
