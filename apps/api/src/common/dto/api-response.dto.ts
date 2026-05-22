export class ApiResponseDto<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
