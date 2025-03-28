
import { Button } from "@/components/ui/button"
import {
    Dialog,

    DialogContent,

    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {toast} from "react-hot-toast"

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useState , useRef} from "react"

import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {useTimetable} from "@/context/timetable/timetable-context.tsx";
import {ITimetable} from "@/data-types/timetable.tp.ts";
import {updateTimetable} from "@/services/timetable.service.ts";
import {Pencil} from "lucide-react";

const formSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters." }),
    description: z.string().min(5, { message: "Description must be at least 5 characters." }),
    groupName: z.string().min(2, { message: "Group name must be at least 2 characters." }),
    isPublished: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function UpdateTimeTableDetailsDialog({selectedTimetable} : {selectedTimetable: ITimetable}) {

    const {getTimetables} = useTimetable();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dialogContentRef = useRef<HTMLDivElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: selectedTimetable.title,
            description: selectedTimetable.description,
            groupName: selectedTimetable.group,
            isPublished: selectedTimetable.isPublished,
        },
    });

    // ✅ Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            await updateTimetable(selectedTimetable.id, data);
            toast.success("Timetable updated successfully!");
            form.reset();
            setIsOpen(false)
            await getTimetables(); // Refresh the list after adding
        } catch (error) {
            console.error("Error updating timetable:", error);
            toast.error("Error updating timetable.");
        }
    };
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dialogContentRef.current && !dialogContentRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);


    return (
        <Dialog open={isOpen}>
            <DialogTrigger asChild>
                <Button onClick={()=> setIsOpen(true)} variant={'outline'} size={"icon"} className={'cursor-pointer hover:text-white hover:bg-green-400'}>
                    <Pencil/>
                </Button>
            </DialogTrigger>
            <DialogContent ref={dialogContentRef} className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Time Table Details</DialogTitle>
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
