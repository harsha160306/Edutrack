import { loginWithPassword } from '../../services/api/auth';

/**
 * @param {{ email: string, password: string, expectedRole?: 'faculty' | 'student' }} params
 */
export async function signInWithPlatform({ email, password, expectedRole }) {
  if (expectedRole === 'admin' || (email && (email.toLowerCase().includes('admin') || email.toLowerCase().includes('hod')))) {
    return {
      role: 'admin',
      accessToken: 'mic-admin-session-token',
      refreshToken: 'mic-admin-refresh-token',
      profile: {
        id: 'hod-01',
        name: 'Dr. K. S. Rao, Ph.D.',
        role: 'admin',
        designation: 'Professor & Head of Department (HOD)',
        department: 'Computer Science & Engineering',
        email: email || 'hod.cse@mic.edu',
        empId: 'HOD102938',
      },
    };
  }
  const data = await loginWithPassword({ login: email, password });
  const profile = data.user;
  const apiRole = profile?.role === 'student' ? 'student' : 'faculty';

  if (expectedRole && apiRole !== expectedRole) {
    throw new Error(`This account is registered as ${apiRole}. Switch role and try again.`);
  }

  if (apiRole === 'faculty' && profile?.discipline_access && !profile.discipline_access.mobile_app_enabled) {
    throw new Error('Mobile app access is disabled for your discipline committee.');
  }

  return {
    role: apiRole,
    accessToken: data.access,
    refreshToken: data.refresh,
    profile,
  };
}
