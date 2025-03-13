import {useNavigate} from "react-router-dom";
import {Button, Card} from "@mui/material";

export const HomePage = () => {

    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/dashboard');
    }


    return (
        <div>
            {/*<Button color={"success"} variant="contained" onClick={handleNavigate}>Navigate to dashboard</Button>*/}

            <div className={'mt-10 p-10'}>
                <Card className={'p-5'}>

                </Card>
            </div>
        </div>
    )
}
