import {useEffect, useState} from "react";
import {getTimetables} from "@/services/timetable.service.ts";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ITimetable} from "@/data-types/timetable.tp.ts";

export const TimeTablePage = () => {

    const [timetables, setTimetables] = useState<ITimetable[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getTimetables().then( response => {

            setTimetables(response);
        })
    }, []);

    console.log(timetables)


    return (
        <div>
            <div>
                <div className={'flex flex-row justify-end items-center'}>
                    <Button className={'cursor-pointer'} onClick={() => navigate('/admin/dashboard/timetable/add')}>Add
                        Timetable</Button>
                </div>
            </div>
            <div className={'mt-5'}>
                <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
                    {timetables?.map((item) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <CardTitle>{item.course}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{item.endTime}</CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button className={'cursor-pointer'} onClick={() => navigate(`/admin/dashboard/timetable/${item.id}`)}>View</Button>
                            </CardFooter>
                        </Card>
                    ))
                    }
                </div>

            </div>
        </div>
    )
}
