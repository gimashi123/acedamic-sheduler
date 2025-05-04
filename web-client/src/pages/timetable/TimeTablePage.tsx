
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

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { ITimetable } from "@/data-types/timetable.tp.ts";

import {AddTimeTableDetailsDialog} from "@/pages/timetable/AddTimeTableDetailsDialog.tsx";
import {useTimetable} from "@/context/timetable/timetable-context.tsx";
import { deleteTimetable } from '@/services/timetable.service.ts';
import {CalendarPlus2, Eye,  Trash} from "lucide-react";
import {UpdateTimeTableDetailsDialog} from "@/pages/timetable/UpdateTimeTableDetailsDialog.tsx";

import {toast} from "react-hot-toast";

export const TimeTablePage = () => {

    const navigate = useNavigate();
    const {timetables} = useTimetable();


    const handleViewTimetable = (timetable: ITimetable) => {
        navigate(`/admin/dashboard/timetable/view`, { state: { timetable } });
    }

    return (
        <div>
            <div>
                <div className={'flex flex-row justify-end items-center'}>
                    {/*<Button clas sName={'cursor-pointer hover:bg-green-800'} onClick={() => navigate('/admin/dashboard/timetable/add-details')}>*/}
                    {/*    Add Details*/}
                    {/*</Button>*/}
                    <AddTimeTableDetailsDialog/>
                </div>
            </div>
            <div className={'mt-5'}>
                <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
                    {timetables?.map((item) => (
                        <Card key={item.id} >
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
                                    <Button variant={'outline'} size={"icon"} className={'cursor-pointer hover:text-white hover:bg-green-400'} onClick={()=>handleViewTimetable(item)}>
                                        <Eye/>
                                    </Button>
                                    <Button variant={'outline'} size={"sm"} className={'cursor-pointer hover:text-white hover:bg-green-400'} onClick={() => navigate(`/admin/dashboard/timetable/add`)}>
                                        <CalendarPlus2/>
                                    </Button>

                                    <DeleteTimeTableAlert selectedTimetable={item} />

                                    <UpdateTimeTableDetailsDialog selectedTimetable={item}/>


                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};



const DeleteTimeTableAlert = ( { selectedTimetable} : { selectedTimetable: ITimetable}) => {

    const {getTimetables } = useTimetable();
    const handleDelete = async () => {
        try {
            if (!selectedTimetable?.id) return;
            await deleteTimetable(selectedTimetable.id);
            toast.success("Timetable deleted successfully!");
            await getTimetables(); // Refresh the list after deletion
        } catch (error) {
            console.error("Error deleting timetable:", error);
            toast.error("Failed to delete timetable.");
        }
    };

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>

            <Button variant={'outline'} size={"icon"} className={'cursor-pointer hover:text-white hover:bg-red-400'}>
                <Trash/>
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              timetable and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
};
