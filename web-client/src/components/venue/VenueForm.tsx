import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { addVenue } from "@/services/venue.service";
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

interface VenueFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
  onSuccess?: () => void;
}

interface Venue {
  _id?: string;
  faculty: string;
  department: string;
  building: string;
  hallName: string;
  type: "lecture" | "tutorial" | "lab";
  capacity: number;
}

export default function VenueForm({ initialData, onSuccess }: VenueFormProps) {
  const [formData, setFormData] = useState<Venue>({
    faculty: "",
    department: "",
    building: "",
    hallName: "",
    type: "lecture",
    capacity: 0
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
      faculty: "",
      department: "",
      building: "",
      hallName: "",
      type: "lecture",
      capacity: 0,
    },
  });

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value
    }));
  };

  // Handle form validation and show confirmation
  const handleFormSubmit = () => {
    if (!formData.faculty || !formData.department || !formData.building || !formData.hallName || !formData.type || !formData.capacity) {
      toast.error("Please fill in all required fields");
      return;
    }
    setShowConfirmation(true);
  };

  // Handle final submission
  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      const venueData = {
        ...formData,
        capacity: Number(formData.capacity)
      };

      await addVenue(venueData);
      toast.success("Venue added successfully!");
      reset();
      setFormData({
        faculty: "",
        department: "",
        building: "",
        hallName: "",
        type: "lecture",
        capacity: 0
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to add venue. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <Card className="w-140 p-6">
        <CardContent className="space-y-4 flex flex-col gap-3">
          <div className="flex flex-row gap-5 align-middle">
            {/* Faculty */}
            <div className="flex flex-col gap-2">
              <Label>Faculty</Label>
              <Input 
                {...register("faculty", { required: "Faculty is required" })} 
                placeholder="Enter faculty" 
                className="w-55"
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
                className="w-55"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
              {errors.department && <p className="text-red-500 text-sm">{String(errors.department.message)}</p>}
            </div>
          </div>

          <div className="flex flex-row gap-5 align-middle">
            {/* Building */}
            <div className="flex flex-col gap-2">
              <Label>Building</Label>
              <Input 
                {...register("building", { required: "Building name is required" })} 
                placeholder="Enter building name" 
                className="w-55"
                name="building"
                value={formData.building}
                onChange={handleChange}
              />
              {errors.building && <p className="text-red-500 text-sm">{String(errors.building.message)}</p>}
            </div>

            {/* Hall Name */}
            <div className="flex flex-col gap-2">
              <Label>Hall Name</Label>
              <Input 
                {...register("hallName", { required: "Hall name is required" })} 
                placeholder="Enter hall name" 
                className="w-55"
                name="hallName"
                value={formData.hallName}
                onChange={handleChange}
              />
              {errors.hallName && <p className="text-red-500 text-sm">{String(errors.hallName.message)}</p>}
            </div>
          </div>
         
          <div className="flex flex-row gap-5 align-middle">
            {/* Type */}
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select 
                onValueChange={(value) => setFormData(prev => ({...prev, type: value as "lecture" | "tutorial" | "lab"}))}
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

            {/* Capacity */}
            <div className="flex flex-col gap-2">
              <Label>Capacity</Label>
              <Input 
                type="number" 
                {...register("capacity", { 
                  required: "Capacity is required", 
                  min: { value: 10, message: "Minimum capacity is 10" }, 
                  max: { value: 500, message: "Maximum capacity is 500" } 
                })} 
                placeholder="Enter capacity" 
                className="w-55"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
              />
              {errors.capacity && <p className="text-red-500 text-sm">{String(errors.capacity.message)}</p>}
            </div>
          </div>
          
          {/* Submit Button */}
          <Button 
            className="w-115" 
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Venue"}
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Venue Addition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add this venue? Please review the details:
              <div className="mt-2 space-y-1">
                <p><strong>Faculty:</strong> {formData.faculty}</p>
                <p><strong>Department:</strong> {formData.department}</p>
                <p><strong>Building:</strong> {formData.building}</p>
                <p><strong>Hall Name:</strong> {formData.hallName}</p>
                <p><strong>Type:</strong> {formData.type}</p>
                <p><strong>Capacity:</strong> {formData.capacity}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
