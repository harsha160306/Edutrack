/** Shared account label + initials for profile avatars (Faculty, Student, HOD/Admin). */
export const getAccountDisplay = (roleOrIsFaculty) => {
  const role =
    typeof roleOrIsFaculty === 'string'
      ? roleOrIsFaculty
      : roleOrIsFaculty
        ? 'faculty'
        : 'student';

  if (role === 'hod' || role === 'admin') {
    return {
      initial: 'H',
      title: 'HOD account',
      fullName: 'Dr. K. S. Rao, Ph.D.',
      designation: 'Professor & Head of Department (HOD)',
      subtitle: 'HOD • Computer Science & Engineering',
      email: 'hod.cse@mic.edu',
      empId: 'HOD102938',
      academicYear: '2025–26',
      joinedYear: '2015',
    };
  }

  const isFaculty = role === 'faculty';
  return {
    initial: isFaculty ? 'F' : 'S',
    title: isFaculty ? 'Faculty account' : 'Student profile',
    fullName: isFaculty ? 'Dr. Arun Kumar' : 'SANDHYA P.',
    designation: isFaculty ? 'Assistant Professor' : 'Student',
    subtitle: isFaculty ? 'Faculty member' : 'SANDHYA P. • 22H71A05A1',
    email: isFaculty ? 'member@mic.edu' : 'student@mic.edu',
    empId: isFaculty ? 'EMP102938' : 'STU220001',
    academicYear: '2025–26',
    joinedYear: isFaculty ? '2022' : '2024',
  };
};
