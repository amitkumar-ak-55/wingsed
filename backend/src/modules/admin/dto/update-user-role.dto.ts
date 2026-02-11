import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
	static readonly ROLE_VALUES = ['STUDENT', 'ADMIN', 'COUNSELOR'] as const;

	@IsNotEmpty()
	@IsIn(UpdateUserRoleDto.ROLE_VALUES)
	role: typeof UpdateUserRoleDto.ROLE_VALUES[number];
}
