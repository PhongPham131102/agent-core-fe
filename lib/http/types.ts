/** Contract response của agent-core-be (TransformInterceptor). */
export interface IApiResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

/** Contract lỗi của agent-core-be (AllExceptionsFilter). */
export interface IApiErrorBody {
  success: false;
  message: string;
  errorCode: string;
  details?: string[];
  statusCode?: number;
  timestamp?: string;
  path?: string;
}

/** Khớp `IPaginatedResult` bên BE. */
export interface IPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/** Khớp `PaginationQueryDto` bên BE. */
export interface IPaginationQuery {
  page?: number;
  limit?: number;
}
