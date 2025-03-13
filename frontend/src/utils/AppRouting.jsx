import {BrowserRouter, Route, Routes} from "react-router-dom";
import {HomePage} from "../pages/Home.jsx";
import {DashboardPage} from "../pages/dashboard/Dashboard.jsx";
import {TimeTablePage} from "../pages/timetable/TimeTablePage.jsx";

export const AppRouting = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={'/'} element={<HomePage/>}/>
                <Route path={'/dashboard'} element={<DashboardPage/>}/>
                <Route path={'/timetable'} element={ <TimeTablePage/>}/>
            </Routes>
        </BrowserRouter>
    )
}
