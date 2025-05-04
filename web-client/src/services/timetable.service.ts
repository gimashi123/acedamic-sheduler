import api from "@/config/axios.config.ts";
import {SlotRequest} from "@/data-types/timetable.tp.ts";
import {toast} from "react-hot-toast";


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

export const deleteTimetable = async (id: string) => {
    try {
        const response = await api.delete(`/timetable/delete/${id}`);
        if(response.data.success){
            return response.data.result;
        }
    } catch (error) {
        console.error("Failed to delete timetable", error);
    }
}
export const getTimetableById = async (id: string) => {
    try {
        const response = await api.get(`/timetable/get/${id}` );
        return response.data.result;
    } catch (error) {
        console.error("Error fetching timetable by ID:", error);
        throw error;
    }
};

export const updateTimetable = async (id: string, data: any) => {
    try {
        const response = await api.put(`/timetable/update/${id}`, data);
        if(response.data.success){
            return response.data.result;
        }
    } catch (error) {
        console.error("Failed to update timetable", error);
    }
}

export const addSlotToTimetable = async (timetableId: string, slot: SlotRequest) => {
    try {
        const response = await api.post(`/timetable/${timetableId}/slots`, slot);
        if(response.data.success){
            toast.success("Slot added successfully");
        }
        if(response.data.success){
            return response.data.result;
        }
    } catch (error) {
        console.error("Failed to add slot to timetable", error);
    }
}