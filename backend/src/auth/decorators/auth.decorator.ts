import { SetMetadata } from '@nestjs/common';
import { UserType } from '../enums/user-type.enum.js';

export const USER_TYPE_KEY = 'user_type';
export const PUBLIC_ROUTE_KEY = 'public_key';

/*
INFO: This decorator can be used to mark the authorized
user types that can access an endpoint.
WARN: if used to decorate a method with zero params its
then allowing all user types in
*/
export const RequiredUserTypes = (...user_types: UserType[]) =>
    SetMetadata(USER_TYPE_KEY, user_types);

/*
INFO: This decorator can be user to expose an endpoint
to non authonticated users!
*/
export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
