import {useState} from "react";


export const DashboardPage = () => {

    const [count, setCount] = useState(0);

    const handleCount = () => {
        setCount(count + 1);
    }

    return (
        <div>

        </div>

    )
}