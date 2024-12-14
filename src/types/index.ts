export interface ApiResponse<T> {
  message: string;
  data: T | null;
  error: string | null;
  statusCode: number;
}
