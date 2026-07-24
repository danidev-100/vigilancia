import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest<T>(_err: Error | null, user: T): T | undefined {
    // Don't throw — just return undefined if no valid token
    return user ?? undefined;
  }

  canActivate(context: ExecutionContext) {
    // Call super but catch errors so they don't propagate
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}
