import appConfig from '../app.json';

const expo = appConfig.expo ?? {};

/** User-facing app version (app store / package version). */
export const APP_VERSION = expo.version ?? '1.0.0';

/**
 * Build identifier — `expo.extra.buildNumber`, else native build codes.
 * Update `extra.buildNumber` in app.json when shipping a new build.
 */
export const APP_BUILD = String(
  expo.extra?.buildNumber ??
    expo.android?.versionCode ??
    expo.ios?.buildNumber ??
    '1',
);

export const COPYRIGHT_HOLDER = 'MIC College of Technology';

export const formatVersionLabel = () => `Version ${APP_VERSION}`;

export const formatBuildLabel = () => `Build ${APP_BUILD}`;

export const formatVersionWithBuild = () => `${formatVersionLabel()} · ${formatBuildLabel()}`;

/** Login footer style: v1.0.0 (Build 20260503.1) */
export const formatVersionCompact = () => `v${APP_VERSION} (Build ${APP_BUILD})`;

export const getCopyrightLine = (year = new Date().getFullYear()) =>
  `© ${year} ${COPYRIGHT_HOLDER}. All rights reserved.`;

export const getLoginCopyrightLine = (year = new Date().getFullYear()) =>
  `© ${year} DVR & Dr. HS MIC College. All Rights Reserved.`;
