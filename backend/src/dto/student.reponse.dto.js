export const studentResponseDto = (student) => {
    return {
      id: student._id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      degreeProgram: student.degreeProgram,
      group: student.groupNumber ? {
        id: student.groupNumber._id,
        name: student.groupNumber.name
      } : null,
      subjects: student.subjectsEnrolled ? student.subjectsEnrolled.map(subject => ({
        id: subject._id,
        name: subject.name,
        code: subject.code
      })) : [],
      dateOfBirth: student.dateOfBirth,
      guardianContact: student.guardianContact,
      address: student.address,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    };
  };