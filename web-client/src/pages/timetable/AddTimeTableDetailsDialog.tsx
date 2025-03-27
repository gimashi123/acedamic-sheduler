
import { Button } from "@/components/ui/button"
import {
    Dialog,

    DialogContent,
    DialogDescription,

    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import axios from "axios";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";

const formSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters." }),
    description: z.string().min(5, { message: "Description must be at least 5 characters." }),
    groupName: z.string().min(2, { message: "Group name must be at least 2 characters." }),
    isPublished: z.enum(["published", "not_published"]),
});


type FormValues = z.infer<typeof formSchema>;

export function AddTimeTableDetailsDialog() {

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            groupName: "",
            isPublished: "not_published",
        },
    });

    // ✅ Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            const response = await axios.post("http://localhost:5000/api/timetable/create", {
                title: data.title,
                description: data.description,
                groupName: data.groupName,
                isPublished: data.isPublished === "published", // Convert string to boolean
            });
            console.log("Submitted Data:", response.data);
            alert("Timetable added successfully!");
            form.reset();
        } catch (error) {
            console.error("Error adding timetable:", error);
            alert("Error submitting timetable.");
        }
    };


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default">Add Details</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Time Table Details</DialogTitle>
                    <DialogDescription>
                        Add details to the time table
                    </DialogDescription>
                </DialogHeader>
                <Form {...form} >
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="  w-full max-w-md space-y-6"
                    >
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Group Name */}
                        <FormField
                            control={form.control}
                            name="groupName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Is Published (Radio Buttons) */}
                        <FormField
                            control={form.control}
                            name="isPublished"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Is Published</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="published" id="published" />
                                                <label htmlFor="published">Published</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="not_published" id="not_published" />
                                                <label htmlFor="not_published">Not Published</label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <Button type="submit" className="w-full">
                            Submit
                        </Button>

                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    )
}
