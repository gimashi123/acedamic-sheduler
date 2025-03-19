import {BrowserRouter, Route, Routes} from "react-router-dom";
import {HomePage} from "../pages/Home.tsx";

import AdminDashboardPage from "@/pages/dashboard/AdminDashboard.tsx";
import {TimeTablePage} from "@/pages/timetable/TimeTablePage.tsx";
import {UserPage} from "@/pages/user/UserPage.tsx";
import {AddTimeTablePage} from "@/pages/timetable/AddTimeTablePage.tsx";
import {ViewTimeTablePage} from "@/pages/timetable/ViewTimeTablePage.tsx";
import {AddDetails} from "@/pages/timetable/AddDetails.tsx";


export const AppRouting = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={'/'} element={<HomePage/>}/>
                <Route path={'/admin/dashboard/*'} element={<AdminDashboardPage/>}>
                    <Route path={'timetable'} >
                        <Route path={''} element={<TimeTablePage/>}/>
                        <Route path={'add-details'} element={<AddDetails/>}/>
                        <Route path={'add'} element={<AddTimeTablePage/>}/>
                        <Route path={'view'} element={<ViewTimeTablePage/>}/>
                    </Route>
                    <Route path={'user'} element={<UserPage/>}/>

                </Route>
            </Routes>
        </BrowserRouter>
    )
}
