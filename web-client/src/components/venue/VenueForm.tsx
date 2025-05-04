import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import React, { useState } from "react";
import {addVenue, updateVenue} from "@/services/venue.service";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import {toast} from "react-hot-toast";

interface VenueFormProps {
    onSubmit?: (data: Venue) => void;
    initialData?: Venue;
    onSuccess?: () => void;
    children?: React.ReactNode;
    mode?: "add" | "edit";
}

interface Venue {
    id?: string;
    department: string;
    building: string;
    hallName: string;
    type: "lecture" | "tutorial" | "lab";
    capacity: number;
}

export default function VenueForm({ initialData, onSuccess, children, mode = "add" }: VenueFormProps) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<Venue>({
        defaultValues: initialData || {
            department: "",
            building: "",
            hallName: "",
            type: "lecture",
            capacity: 0,
        },
    });

    const typeValue = watch("type");

    const handleFormSubmit = (data: Venue) => {
        if (!data.department || !data.building || !data.hallName || !data.type || !data.capacity) {
            toast.error("Please fill in all required fields");
            return;
        }
        setDialogOpen(false);
        setShowConfirmation(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            setIsSubmitting(true);
            const venueData = {
                ...watch(),
                capacity: Number(watch("capacity"))
            };


            if (mode === "edit" && initialData?.id) {
                await updateVenue(initialData.id, venueData);
            } else {
                await addVenue(venueData);
            }


            toast.success(`Venue ${mode === "add" ? "added" : "updated"} successfully!`);
            reset();
            setDialogOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(`Failed to ${mode === "add" ? "add" : "update"} venue. Please try again.`);
        } finally {
            setIsSubmitting(false);
            setShowConfirmation(false);
        }
    };

    return (
        <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    {children || <Button variant="default">{mode === "add" ? "Add Venue" : "Edit"}</Button>}
                </DialogTrigger>

                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{mode === "add" ? "Create New Venue" : "Edit Venue"}</DialogTitle>
                        <DialogDescription>
                            {mode === "add"
                                ? "Fill in the details to add a new venue"
                                : "Update the venue information below"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Department */}
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    {...register("department", { required: "Department is required" })}
                                    placeholder="Enter department"
                                />
                                {errors.department && (
                                    <p className="text-sm text-red-500">{errors.department.message}</p>
                                )}
                            </div>

                            {/* Building */}
                            <div className="space-y-2">
                                <Label htmlFor="building">Building</Label>
                                <Input
                                    id="building"
                                    {...register("building", { required: "Building is required" })}
                                    placeholder="Enter building name"
                                />
                                {errors.building && (
                                    <p className="text-sm text-red-500">{errors.building.message}</p>
                                )}
                            </div>

                            {/* Hall Name */}
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="hallName">Hall Name</Label>
                                <Input
                                    id="hallName"
                                    {...register("hallName", { required: "Hall name is required" })}
                                    placeholder="Enter hall name"
                                />
                                {errors.hallName && (
                                    <p className="text-sm text-red-500">{errors.hallName.message}</p>
                                )}
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={typeValue}
                                    onValueChange={(value) => setValue("type", value as Venue["type"])}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lecture">Lecture Hall</SelectItem>
                                        <SelectItem value="tutorial">Tutorial Room</SelectItem>
                                        <SelectItem value="lab">Laboratory</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Capacity */}
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    {...register("capacity", {
                                        required: "Capacity is required",
                                        min: { value: 10, message: "Minimum capacity is 10" },
                                        max: { value: 500, message: "Maximum capacity is 500" }
                                    })}
                                    placeholder="Enter capacity"
                                />
                                {errors.capacity && (
                                    <p className="text-sm text-red-500">{errors.capacity.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === "add" ? "Add Venue" : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Venue {mode === "add" ? "Addition" : "Update"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please review the venue details:
                            <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="font-medium">Department:</span>
                                    <span>{watch("department")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Building:</span>
                                    <span>{watch("building")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Hall Name:</span>
                                    <span>{watch("hallName")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Type:</span>
                                    <span className="capitalize">{watch("type")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Capacity:</span>
                                    <span>{watch("capacity")}</span>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                `Confirm ${mode === "add" ? "Addition" : "Update"}`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}