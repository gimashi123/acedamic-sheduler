export const getSubjectResponse = (subject) => {
  const response = {
    id: subject._id,
    name: subject.name,
    code: subject.code,
    credits: subject.credits,
    lecturer: subject.lecturer
  };

  // If lecturer is populated, return only necessary info
  if (subject.lecturer && typeof subject.lecturer === 'object') {
    response.lecturer = {
      id: subject.lecturer._id,
      firstName: subject.lecturer.firstName,
      lastName: subject.lecturer.lastName,
      email: subject.lecturer.email
    };
  }

  return response;
}; 