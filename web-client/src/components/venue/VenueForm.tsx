import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { addVenue } from "@/services/venue.service";

interface VenueFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

interface Venue {
  _id?: string,
  faculty: string,
  building: string,
  hallName: string,
  type: "lecture" | "tutorial" | "lab",
  capacity: number
}

export default function VenueForm({ initialData }: VenueFormProps) {
  const [formData, setFormData] = useState<Venue>({
    faculty: "",
    building: "",
    hallName: "",
    type: "lecture",
    capacity: 0
  });

  const {
    register,
    handleSubmit,
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

  // handle input field changes 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // handle form submission
  const onSubmit = async() => {
    try {
      await addVenue(formData);
      setFormData({
        faculty: "",
        building: "",
        hallName: "",
        type: "lecture",
        capacity: 0
      });
    } catch(error) {
      console.error("Error submitting form: ", error);
    }
  };

  return (
    <Card className="w-140 p-6">
      <CardContent className="space-y-4 flex flex-col gap-3">

        <div className="flex flex-row gap-5 align-middle">

          {/* Faculty */}
          <div className="flex flex-col gap-2">
            <Label>Faculty</Label>
            <Input {...register("faculty", { required: "Faculty is required" })} 
              placeholder="Enter faculty" 
              className="w-55"
              value={formData.faculty}
              onChange={handleChange}
            />
            {errors.faculty && <p className="text-red-500 text-sm">{String(errors.faculty.message)}</p>}
          </div>
          
          {/* Building */}
          <div className="flex flex-col gap-2">
            <Label>Building</Label>
            <Input {...register("building", { required: "Building name is required" })} 
            placeholder="Enter building name" 
            className="w-55"
            value={formData.building}
            onChange={handleChange}
          />
            {errors.building && <p className="text-red-500 text-sm">{String(errors.building.message)}</p>}
          </div>
          
        </div>
       
        <div className="flex flex-row gap-5 align-middle">

          {/* Hall Name */}
          <div className="flex flex-col gap-2">
            <Label>Hall Name</Label>
            <Input {...register("hall", { required: "Hall name is required" })} 
            placeholder="Enter hall name" 
            className="w-55"
            value={formData.hallName}
            onChange={handleChange}
          />
            {errors.hallName && <p className="text-red-500 text-sm">{String(errors.hallName.message)}</p>}
          </div>
          
          {/* Type */}
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <Select onValueChange={(value) => setFormData({...formData, type: value as "lecture" | "tutorial" | "lab"})}
              value={formData.type}
            >
              <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lecture">Lecture</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="lab">Lab</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">Type is required</p>}
          </div>

        </div>
        
        {/* Capacity */}
        <div className="flex flex-col gap-2">
          <Label>Capacity</Label>
          <Input type="number" {...register("capacity", { 
            required: "Capacity is required", 
            min: { value: 10, message: "Minimum capacity is 10" }, 
            max: { value: 500, message: "Maximum capacity is 500" } 
          })} placeholder="Enter capacity" className="w-115"/>
          {errors.capacity && <p className="text-red-500 text-sm">{String(errors.capacity.message)}</p>}
        </div>
        
        {/* Submit Button */}
        <Button className="w-115" onClick={handleSubmit(onSubmit)}>Submit</Button>
      </CardContent>
    </Card>
  );
}
