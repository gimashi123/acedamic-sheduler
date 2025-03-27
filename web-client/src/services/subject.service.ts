import axiosConfig from '@/config/axios.config.ts';
import { ISubjectRequest } from '@/data-types/subject.tp.ts';

export const addSubject = async (addSubjectReq: ISubjectRequest) => {
  try {
    const response = await axiosConfig.post('/subject/add', addSubjectReq);

    if (response.data.success) {
      alert('successfully added subject');
    } else {
      alert('failed to add subject');
    }
  } catch (e) {
    console.log(e);
  }
};
