export const getSubjectResponse = (subject) => {
  return {
    id: subject._id,
    code: subject.code,
    name: subject.name,
    credits: subject.credits,
  };
};
