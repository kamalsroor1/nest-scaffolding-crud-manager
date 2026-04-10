import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Catches all exceptions and returns a unified error response format.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  /**
   * Formats the exception into the project's standard error envelope.
   * @param exception The caught exception
   * @param host Arguments host
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request['requestId'];

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errors =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message || []
        : [];

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      errors: Array.isArray(errors) ? errors : [errors],
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    this.logger.error(
      `${request.method} ${request.url} ${status} - RequestId: ${requestId} - Message: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }
}
