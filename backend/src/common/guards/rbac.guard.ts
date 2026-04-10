import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * RBAC Guard skeleton.
 * Currently allows all requests. Enforcement of resource:action will be implemented in Sprint 2.
 */
@Injectable()
export class RbacGuard implements CanActivate {
  /**
   * Determines if the request is authorized.
   * @param context Execution context
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // TODO Sprint 2: implement resource:action check using JWT roles/permissions
    return true;
  }
}
