import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { TimeTablePage } from "../pages/TimeTablePage"; // Import the TimeTablePage component
import { Box, Typography } from "@mui/material"; // Import Material UI components

export const DashboardContent = () => {
    const [path, setPath] = useState('');
    const location = useLocation();

    useEffect(() => {
        setPath(location.pathname);
    }, [location]);

    return (
        <Box sx={{ padding: 2 }}>
            {/* Optionally, add some Typography for heading */}
            <Typography variant="h4" gutterBottom>
                Dashboard Content
            </Typography>

            {/* Conditionally render the TimeTablePage based on the path */}
            {path === '/dashboard/timetable' && <TimeTablePage />}
        </Box>
    );
};
