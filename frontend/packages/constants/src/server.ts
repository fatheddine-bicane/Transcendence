import 'server-only';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

/** Matches Nest JwtModule `signOptions.expiresIn` (`15m`). */
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15;

/** Matches Nest refresh JWT lifetime (7 days). */
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
