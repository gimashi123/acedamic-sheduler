import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {TimeTablePage} from "@/pages/timetable/TimeTablePage.tsx";

export const DashboardContent = () => {
    const [path, setPath] = useState('');
    const location = useLocation();

    useEffect(() => {
        setPath(location.pathname);
    }, [location]);


    return (
        path === '/dashboard/timetable' && <TimeTablePage/>
    );
};
