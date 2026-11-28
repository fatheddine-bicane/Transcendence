import 'server-only';

import { decodeJwt } from 'jose';
import {
    getAccessToken,
    getValidAccessToken,
    isAccessTokenExpired,
} from '@repo/api/auth/session';

/** Nest JWT claim; matches `UserType.INTERNAL`. */
const INTERNAL_USER_TYPE = 'internal';

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
