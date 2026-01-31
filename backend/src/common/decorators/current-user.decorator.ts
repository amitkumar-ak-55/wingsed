import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, ClerkUser } from '../guards/clerk-auth.guard';

/**
 * Decorator to extract the current authenticated user from the request.
 * Must be used with ClerkAuthGuard.
 *
 * @example
 * @Get('me')
 * @UseGuards(ClerkAuthGuard)
 * getProfile(@CurrentUser() user: ClerkUser) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof ClerkUser | undefined, ctx: ExecutionContext): ClerkUser | string | null => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return null;
    }

    // If a specific property is requested, return just that
    if (data) {
      return user[data];
    }

    return user;
  },
);
