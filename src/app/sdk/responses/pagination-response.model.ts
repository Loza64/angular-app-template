export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    nextCursor: string;
    pageCount: number;
  };
}