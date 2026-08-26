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
 * Header names whose values must never appear in log output. Even on error
 * paths we should never write authorization tokens, session cookies, or API
 * keys to disk — a leaked log file would let an attacker replay credentials.
 */
const REDACTED_HEADERS = new Set(['authorization', 'cookie', 'set-cookie', 'x-api-key']);

function redactHeaders(headers: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!headers) return {};
  const out: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(headers)) {
    out[name] = REDACTED_HEADERS.has(name.toLowerCase()) ? '[REDACTED]' : value;
  }
  return out;
}

function scrubString(input: unknown): string {
  if (input === null || input === undefined) return '';
  const s = String(input);
  return s
    .replace(/(authorization\s*[:=]\s*)([^\s,;]+)/gi, '$1[REDACTED]')
    .replace(/(x-api-key\s*[:=]\s*)([^\s,;]+)/gi, '$1[REDACTED]')
    .replace(/(cookie\s*[:=]\s*)([^\s,;]+)/gi, '$1[REDACTED]');
}

// Catch EVERYTHING — not just HttpException. Nest's default behaviour for an
// uncaught error is to return a 500 with the stack trace in the body and
// no structured logging. Widening this filter is the single point where
// every escape-from-a-route error is logged with a redacted trace and a
// consistent 500 response, with the auth/cookie headers scrubbed before
// they hit disk.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HttpException carries its own status + structured message; everything
    // else is a 500 (DB error, AssertionError, unhandled promise rejection,
    // throw of a plain string/number, etc.). For a non-HttpException we
    // still want the redacted log line + the safe 500 response shape so
    // upstream callers don't see a Nest stacktrace.
    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorName = isHttp
      ? exception.name
      : ((exception as Error)?.name ?? 'InternalServerError');
    const errorMessage = isHttp
      ? exception.message
      : ((exception as Error)?.message ?? 'Internal server error');
    const errorResponse = isHttp ? exception.getResponse() : { message: errorMessage };

    const safeHeaders = redactHeaders(request.headers as any);
    // For non-HttpException, also log the stack so on-call can root-cause
    // — but only via the structured logger, never in the response body.
    if (!isHttp) {
      this.logger.error(
        `${request.method} ${request.url} 500 - unhandled ${errorName}: ${scrubString(errorMessage)} ` +
          `headers=${JSON.stringify(safeHeaders)}`,
        (exception as Error)?.stack,
      );
    } else {
      this.logger.error(
        `${request.method} ${request.url} ${status} - ${scrubString(errorMessage)} ` +
          `headers=${JSON.stringify(safeHeaders)}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      message: typeof errorResponse === 'string' ? errorResponse : (errorResponse as any).message,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
