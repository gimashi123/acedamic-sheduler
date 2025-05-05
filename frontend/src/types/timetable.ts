export interface ITimetable {
  id: string;
  title: string;
  description: string;
  group: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimetableFormData {
  title: string;
  description: string;
  groupName: string;
  isPublished: boolean;
} 