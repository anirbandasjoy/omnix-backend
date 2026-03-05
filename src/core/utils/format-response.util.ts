export interface ResponseFormat<T> {
  success: boolean;
  statusCode: number;
  message: string;
  results: T;
  meta?: Record<string, any> | null;
}

export function sendResponse<T>({
  success = true,
  statusCode = 200,
  message = 'Success',
  meta = null,
  results,
}: {
  success?: boolean;
  statusCode?: number;
  message?: string;
  meta?: Record<string, any> | null;
  results: T;
}): ResponseFormat<T> {
  return {
    success: success,
    statusCode,
    message,
    ...(meta ? { meta } : {}),
    results,
  };
}
