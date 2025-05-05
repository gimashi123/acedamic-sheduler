export const getSubjectResponse = (subject) => {
  return {
    id: subject._id,
    name: subject.name,
    code: subject.code,
    credits: subject.credits
  };
}; 