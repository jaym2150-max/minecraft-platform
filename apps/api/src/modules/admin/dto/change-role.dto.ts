import { IsIn } from 'class-validator';

export class ChangeRoleDto {
  @IsIn(['USER', 'MODERATOR', 'ADMIN', 'OWNER'])
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';
}
