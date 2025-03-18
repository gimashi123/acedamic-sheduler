import api from "@/config/axios.config.ts";


export const getTimetables = async () => {
    try {
        const response = await api('/timetable/get/all');
        if(response.data.success){
            return response.data.result;
        }
    } catch (error) {
        console.error("Failed to fetch timetables", error);
    }
}