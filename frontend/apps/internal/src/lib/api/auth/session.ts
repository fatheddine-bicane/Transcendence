import 'server-only';

import { decodeJwt } from 'jose';
import { connection } from 'next/server';
import { getAccessTokenCookie } from './cookies';

/** Nest JWT claim; matches `UserType.INTERNAL`. */
const INTERNAL_USER_TYPE = 'internal';

/** Raw access JWT from the httpOnly cookie (may be missing or expired). */
async function getAccessToken() {
    return getAccessTokenCookie();
}

/**
 * Soft expiry check from JWT `exp` (decode only — Nest remains the authority).
 * `skewSeconds` treats near-expiry as expired so RSC can render SilentRefresh early.
 * Requires request time (`connection()` / cookies) inside Suspense — uses `Date.now()`.
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

/**
 * Read Nest `user_type` claim (decode only). Returns `null` if missing/malformed.
 */
function getAccessTokenUserType(token: string) {
    try {
        const payload = decodeJwt(token);
        const userType = payload.user_type;
        return typeof userType === 'string' ? userType : null;
    } catch {
        return null;
    }
}

function isInternalAccessToken(token: string) {
    return getAccessTokenUserType(token) === INTERNAL_USER_TYPE;
}

/** Cookie present and not past `exp` (with skew); otherwise `null` → SilentRefresh gate. */
async function getValidAccessToken() {
    // Date.now() below needs request time; RequireAccess wraps this in Suspense.
    await connection();

    const token = await getAccessToken();
    if (!token || isAccessTokenExpired(token)) return null;
    return token;
}

/**
 * Valid non-expired access cookie with `user_type === internal`.
 * Wrong role → `null` (portal should clear cookies / redirect).
 */
async function getValidInternalAccessToken() {
    const token = await getValidAccessToken();
    if (!token || !isInternalAccessToken(token)) return null;
    return token;
}

export {
    INTERNAL_USER_TYPE,
    getAccessToken,
    getAccessTokenUserType,
    getValidAccessToken,
    getValidInternalAccessToken,
    isAccessTokenExpired,
    isInternalAccessToken,
};
