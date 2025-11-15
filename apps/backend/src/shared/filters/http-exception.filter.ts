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

    // Log the error with detailed context
    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message: exception instanceof Error ? exception.message : message,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    // Log based on severity
    if (status >= 500) {
      this.logger.error(
        `Server Error: ${errorLog.message}`,
        errorLog.stack,
        JSON.stringify(errorLog, null, 2),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `Client Error: ${errorLog.message}`,
        JSON.stringify(errorLog, null, 2),
      );
    }

    // Send response
    response.status(status).json({
      statusCode: status,
      timestamp: errorLog.timestamp,
      path: request.url,
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || message,
    });
  }
}
