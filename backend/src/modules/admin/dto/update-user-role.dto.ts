import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsIn(['STUDENT', 'ADMIN', 'COUNSELOR'])
  role: 'STUDENT' | 'ADMIN' | 'COUNSELOR';
}
