import { useEffect, useState } from "react";
import { getTimetables, deleteTimetable } from "@/services/timetable.service.ts"; // Import delete function
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ITimetable } from "@/data-types/timetable.tp.ts";
import {AddTimeTableDetailsDialog} from "@/pages/timetable/AddTimeTableDetailsDialog.tsx";

export const TimeTablePage = () => {
    const [timetables, setTimetables] = useState<ITimetable[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTimetables();
    }, []);

    // Fetch all timetables from the backend
    const fetchTimetables = async () => {
        try {
            const response = await getTimetables();
            setTimetables(response);
        } catch (error) {
            console.error("Error fetching timetables:", error);
        }
    };

    // Handle Delete Timetable
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this timetable?")) return;

        try {
            if(!id) return;
            await deleteTimetable(id);
            alert("Timetable deleted successfully!");
            fetchTimetables(); // Refresh the list after deletion
        } catch (error) {
            console.error("Error deleting timetable:", error);
            alert("Failed to delete timetable.");
        }
    };


    return (
        <div>
            <div>
                <div className={'flex flex-row justify-end items-center'}>
                    {/*<Button className={'cursor-pointer hover:bg-green-800'} onClick={() => navigate('/admin/dashboard/timetable/add-details')}>*/}
                    {/*    Add Details*/}
                    {/*</Button>*/}
                    <AddTimeTableDetailsDialog/>
                </div>
                <div><Button className={'cursor-pointer hover:bg-blue-800'} onClick={() => navigate('/admin/dashboard/timetable')}>dialog</Button></div>
            </div>
            <div className={'mt-5'}>
                <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
                    {timetables?.map((item) => (
                        <Card key={item._id} >
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{item.description}</CardDescription>
                            </CardContent>
                            <CardContent>
                                <CardDescription>{item.group}</CardDescription>
                            </CardContent>
                            <CardContent>
                                <CardDescription>{item.isPublished ? 'Published' : 'Not Published'}</CardDescription>
                            </CardContent>
                            <CardFooter>
                                <div className="flex gap-x-4">
                                    <Button size={"sm"} className={'cursor-pointer hover:bg-green-400'} onClick={() => navigate(`/admin/dashboard/timetable/view`)}>
                                        View
                                    </Button>
                                    <Button size={"sm"} className={'cursor-pointer hover:bg-green-400'} onClick={() => navigate(`/admin/dashboard/timetable/add`)}>
                                        Add TimeTable
                                    </Button>
                                    <Button size={"sm"}  className={'cursor-pointer hover:bg-red-500'} onClick={() => handleDelete(item._id)}>
                                        Delete
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
