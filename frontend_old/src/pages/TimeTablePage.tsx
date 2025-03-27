import { useEffect, useState } from "react";
import { getTimetables } from "../services/timetable.service";
import { Button } from "@mui/material"; // Material UI Button
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardActions, Typography, CardHeader } from "@mui/material"; // Material UI Card components
import { ITimetable } from "../data-types/timetable.tp";

export const TimeTablePage = () => {
    const [timetables, setTimetables] = useState<ITimetable[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getTimetables().then(response => {
            setTimetables(response);
        });
    }, []);

    console.log(timetables);

    return (
        <div>
            <div>
                <div className="flex flex-row justify-end items-center">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/admin/dashboard/timetable/add')}
                    >
                        Add Details
                    </Button>
                </div>
            </div>
            <div className="mt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {timetables?.map((item) => (
                        <Card key={item.id} sx={{ maxWidth: 345 }}>
                            <CardHeader
                                title={item.title}
                            />
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                    {item.description}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.group}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.isPublished ? 'Published' : 'Not Published'}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    onClick={() => navigate(`/admin/dashboard/timetable/view`)}
                                >
                                    View
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => navigate(`/admin/dashboard/timetable/add`)}
                                >
                                    Add TimeTable
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
