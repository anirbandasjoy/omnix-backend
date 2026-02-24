export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  meta?: Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
  path?: string;
  method?: string;
  timestamp: string;
  correlationId?: string;
}
