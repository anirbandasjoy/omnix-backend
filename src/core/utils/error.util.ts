/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export interface FormattedError {
  name: string;
  message: string;
  stack?: string;
  cause?: any;
  [key: string]: any; // in case of custom error fields
}

/**
 * Converts any Error object into a structured, one-line JSON-safe format.
 */
export function formatError(error: unknown): FormattedError {
  if (error instanceof Error) {
    const formatted: FormattedError = {
      name: error.name,
      message: error.message,
      stack: error.stack?.replace(/\s+/g, ' '), // flatten stack trace
    };

    // Preserve custom fields if any
    for (const key of Object.getOwnPropertyNames(error)) {
      if (!['name', 'message', 'stack'].includes(key)) {
        (formatted as any)[key] = (error as any)[key];
      }
    }

    return formatted;
  }

  // handle non-Error throws
  return {
    name: 'UnknownError',
    message: typeof error === 'string' ? error : JSON.stringify(error),
  };
}

/**
 * Stringify error for logging (single-line output).
 */
export function stringifyError(error: unknown): string {
  return JSON.stringify(formatError(error));
}
