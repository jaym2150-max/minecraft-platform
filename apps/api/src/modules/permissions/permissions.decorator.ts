import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from './permissions.guard';

export const RequirePermissions = (...keys: string[]) => SetMetadata(PERMISSIONS_KEY, keys);
