/** Shared account label + initials for profile avatars. */
export const getAccountDisplay = (isFaculty) => ({
  initial: isFaculty ? 'F' : 'S',
  title: isFaculty ? 'Faculty account' : 'Student profile',
  fullName: isFaculty ? 'Dr. Arun Kumar' : 'SANDHYA P.',
  designation: isFaculty ? 'Assistant Professor' : 'Student',
  subtitle: isFaculty ? 'Faculty member' : 'SANDHYA P. • 22H71A05A1',
  email: isFaculty ? 'member@mic.edu' : 'student@mic.edu',
  empId: isFaculty ? 'EMP102938' : 'STU220001',
  academicYear: isFaculty ? '2025–26' : '2025–26',
  joinedYear: isFaculty ? '2022' : '2024',
});
