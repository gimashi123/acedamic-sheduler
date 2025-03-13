import {useEffect, useState} from "react";
import {getTimetables} from "@/services/timetable.service.ts";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";

export const TimeTablePage = () => {

    const [timetable, setTimetable] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getTimetables().then( response => {
            setTimetable(response);
        })
    }, []);


    return (
        // <div>
        //     <table>
        //         <thead>
        //         <tr>
        //             <th>Course</th>
        //             <th>Instructor</th>
        //             <th>Day</th>
        //             <th>Start Time</th>
        //             <th>End Time</th>
        //             <th>Venue </th>
        //         </tr>
        //         </thead>
        //         <tbody>
        //         {timetable.map((item, index) => {
        //             return (
        //                 <tr key={index}>
        //                     <td>{item.course}</td>
        //                     <td>{item.instructor}</td>
        //                     <td>{item.day}</td>
        //                     <td>{item.startTime}</td>
        //                     <td>{item.endTime}</td>
        //                     <td>{item.venue}</td>
        //                 </tr>
        //             )
        //         })}
        //         </tbody>
        //     </table>
        // </div>
        <div>
         <div className={'flex flex-row justify-end items-center'}>
             <Button className={'cursor-pointer'} onClick={()=> navigate('/admin/dashboard/timetable/add')}>Add Timetable</Button>
         </div>
        </div>
    )
}
