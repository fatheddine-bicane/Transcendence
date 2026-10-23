import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = 'public_key';

/*
INFO: This decorator can be user to expose an endpoint
to non authonticated users!
*/
export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
