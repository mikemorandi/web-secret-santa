import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorMessage = exception instanceof Error ? exception.message : message;

    // Log based on severity with clean format
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} ${errorMessage}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status === 404) {
      // Only log 404s at debug level to reduce noise
      this.logger.debug(`${request.method} ${request.url} - ${status} ${errorMessage}`);
    } else if (status >= 400) {
      this.logger.warn(`${request.method} ${request.url} - ${status} ${errorMessage}`);
    }

    // Send response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || message,
    });
  }
}
