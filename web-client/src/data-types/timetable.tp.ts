export interface ITimetable {
    id: string;
    title: string;
    description: string;
    group: string;
    isPublished: boolean;
}

export interface SlotRequest {
    subject: string;
    instructor: string;
    venue: string;
    day: string;
    startTime: string;
    endTime: string;
}

export  interface VenueOptions {
    id: string;
    hallName: string;
    type: string;
    capacity: number;
}