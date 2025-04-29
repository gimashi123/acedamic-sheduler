
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
import {toast} from "react-hot-toast"

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {useTimetable} from "@/context/timetable/timetable-context.tsx";
import api from "@/config/axios.config.ts";

const formSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters." }),
    description: z.string().min(5, { message: "Description must be at least 5 characters." }),
    groupName: z.string().min(2, { message: "Group name must be at least 2 characters." }),
    isPublished: z.boolean(),
});


type FormValues = z.infer<typeof formSchema>;

export function AddTimeTableDetailsDialog() {

    const {getTimetables} = useTimetable();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            groupName: "",
            isPublished: false,
        },
    });

    // ✅ Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            const response = await api.post("/timetable/create", {
                title: data.title,
                description: data.description,
                groupName: data.groupName,
                isPublished: data.isPublished,
            });
            console.log("Submitted Data:", response.data);
            toast.success("Timetable added successfully!");
            form.reset();
            await getTimetables(); // Refresh the list after adding
        } catch (error) {
            console.error("Error adding timetable:", error);
            toast.error("Error submitting timetable.");
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
                                        <Input {...field} className="w-full" id={'title'}/>
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
                                        <Input {...field} className="w-full" id={'description'} />
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
                                        <Input {...field} className="w-full" id={'groupName'}/>
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
                                            onValueChange={(value) => field.onChange(value === "true")}
                                            value={field.value ? "true" : "false"}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value={"true"} id="published" />
                                                <label htmlFor="published">Published</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value={"false"} id="not_published" />
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
