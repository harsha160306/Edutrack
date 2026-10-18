import appConfig from '../../app.json';

const expo = appConfig.expo ?? {};

/** Override with EXPO_PUBLIC_API_BASE_URL when pointing at a deployed backend. */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  expo.extra?.apiBaseUrl ??
  'http://127.0.0.1:8000/api/v1';

export const endpoints = {
  auth: {
    login: '/auth/login/',
    refresh: '/auth/refresh/',
  },
  identity: {
    me: '/identity/me/',
  },
  latecomers: {
    marks: '/latecomers/marks/',
  },
  discipline: {
    dressCodeMarks: '/discipline/dress-code-marks/',
    fines: '/discipline/fines/',
    appeals: '/discipline/appeals/',
  },
};
