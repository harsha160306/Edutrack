/** Shared account label + initials for profile avatars. */
export const getAccountDisplay = (isFaculty) => ({
  initial: isFaculty ? 'F' : 'S',
  title: isFaculty ? 'Faculty account' : 'Student account',
  fullName: isFaculty ? 'Dr. Arun Kumar' : 'Student Name',
  designation: isFaculty ? 'Assistant Professor' : 'Student',
  subtitle: isFaculty ? 'Faculty member' : 'Student',
  email: isFaculty ? 'member@mic.edu' : 'student@mic.edu',
  empId: isFaculty ? 'EMP102938' : 'STU220001',
  academicYear: isFaculty ? '2025–26' : '2025–26',
  joinedYear: isFaculty ? '2022' : '2024',
});
