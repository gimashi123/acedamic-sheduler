import {useEffect, useState} from "react";
import {getTimetables} from "../../services/timetable.service.js";

export const TimeTablePage = () => {

    const [timetable, setTimetable] = useState([]);

    console.log(timetable)

    useEffect(() => {
        getTimetables().then( response => {
            setTimetable(response);
        })
    }, []);


    return (
        <>timetables</>
    )
}
