import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((responseBody) => {
        // If the controller already returned a formatted response, pass through
        if (
          responseBody &&
          typeof responseBody === 'object' &&
          'success' in responseBody
        ) {
          return responseBody as SuccessResponse<T>;
        }

        // If the response has meta (pagination), wrap it
        if (
          responseBody &&
          typeof responseBody === 'object' &&
          'data' in responseBody &&
          'meta' in responseBody
        ) {
          return {
            success: true,
            data: (responseBody as { data: T }).data,
            meta: (responseBody as { meta: Record<string, unknown> }).meta,
          };
        }

        return { success: true, data: responseBody };
      }),
    );
  }
}
