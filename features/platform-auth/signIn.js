import { loginWithPassword } from '../../services/api/auth';

/**
 * @param {{ email: string, password: string, expectedRole?: 'faculty' | 'student' }} params
 */
export async function signInWithPlatform({ email, password, expectedRole }) {
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
