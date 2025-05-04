export const getSubjectResponse = (subject) => {
  return {
    id: subject._id,
    code: subject.code,
    name: subject.name,
    credits: subject.credits,
  };
};

export const SubjectOptions = (subject) => ({
  id: subject._id,
  code: subject.code,
  credits: subject.credits,
  name: subject.name,
});
