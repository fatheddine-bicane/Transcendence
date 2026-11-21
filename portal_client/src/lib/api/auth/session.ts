import 'server-only';

import { decodeJwt } from 'jose';
import { getAccessTokenCookie } from './cookies';

/** Raw access JWT from the httpOnly cookie (may be missing or expired). */
async function getAccessToken() {
    return getAccessTokenCookie();
}

/**
 * Soft expiry check from JWT `exp` (decode only — Nest remains the authority).
 * `skewSeconds` treats near-expiry as expired so RSC can render SilentRefresh early.
 * Call after request-time I/O (e.g. cookies) inside a Suspense boundary — uses `Date.now()`.
 */
function isAccessTokenExpired(token: string, skewSeconds = 30) {
    try {
        const { exp } = decodeJwt(token);
        if (!exp) return true;

        const now = Math.floor(Date.now() / 1000);
        return exp <= now + skewSeconds;
    } catch {
        return true;
    }
}

/** Cookie present and not past `exp` (with skew); otherwise `null` → SilentRefresh gate. */
async function getValidAccessToken() {
    const token = await getAccessToken();
    if (!token || isAccessTokenExpired(token)) return null;
    return token;
}

export { getAccessToken, getValidAccessToken, isAccessTokenExpired };
