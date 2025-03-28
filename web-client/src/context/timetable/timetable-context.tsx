import {ITimetable} from "@/data-types/timetable.tp.ts";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import api from "@/config/axios.config.ts";

interface TimetableContextProps {
    timetables: ITimetable[] | null;
    loading: boolean;
    getTimetables: () => Promise<void>;
}

const TimetableContext = createContext<TimetableContextProps | undefined>(undefined);

export const TimetableProvider = ({children}: { children: ReactNode }) => {

    const [timetables, setTimetables] = useState<ITimetable[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const getTimetables = async () => {
        try {
            setLoading(true);
            const response = await api.get('/timetable/get/all');
            setLoading(false);

            if (response?.data?.success) {
                setTimetables(response.data.result);
            }
        } catch (e) {
            console.log('Error occurred while fetching timetables', e);
        }
    };

    useEffect(() => {
        getTimetables()
    }, []);


    return (
        <TimetableContext.Provider value={{timetables, loading, getTimetables}}>
            {children}
        </TimetableContext.Provider>
    );

}


export default TimetableContext;

export const useTimetable = () => {
    const context = useContext(TimetableContext);
    if (!context) {
        throw new Error('useTimetable must be used within a TimetableProvider');
    }
    return context;
}

