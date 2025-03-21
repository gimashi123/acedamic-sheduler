import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface VenueFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function VenueForm({ onSubmit, initialData }: VenueFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      faculty: "",
      building: "",
      hall: "",
      type: "",
      capacity: "",
    },
  });

  return (
    <Card className="w-full p-4">
      <CardContent className="space-y-4">
        {/* Faculty/Department */}
        <Label>Faculty/Department</Label>
        <Input {...register("faculty", { required: "Faculty is required" })} placeholder="Enter faculty/department" />
        {errors.faculty && <p className="text-red-500 text-sm">{String(errors.faculty.message)}</p>}

        {/* Building */}
        <Label>Building</Label>
        <Input {...register("building", { required: "Building name is required" })} placeholder="Enter building name" />
        {errors.building && <p className="text-red-500 text-sm">{String(errors.building.message)}</p>}

        {/* Hall Name */}
        <Label>Hall Name</Label>
        <Input {...register("hall", { required: "Hall name is required" })} placeholder="Enter hall name" />
        {errors.hall && <p className="text-red-500 text-sm">{String(errors.hall.message)}</p>}

        {/* Type */}
        <Label>Type</Label>
        <Select onValueChange={(value) => setValue("type", value)} value={watch("type")}>
          <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="lecture">Lecture</SelectItem>
            <SelectItem value="tutorial">Tutorial</SelectItem>
            <SelectItem value="lab">Lab</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-red-500 text-sm">Type is required</p>}

        {/* Capacity */}
        <Label>Capacity</Label>
        <Input type="number" {...register("capacity", { 
          required: "Capacity is required", 
          min: { value: 10, message: "Minimum capacity is 10" }, 
          max: { value: 500, message: "Maximum capacity is 500" } 
        })} placeholder="Enter capacity" />
        {errors.capacity && <p className="text-red-500 text-sm">{String(errors.capacity.message)}</p>}

        {/* Submit Button */}
        <Button className="w-full" onClick={handleSubmit(onSubmit)}>Submit</Button>
      </CardContent>
    </Card>
  );
}
