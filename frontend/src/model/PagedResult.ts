export interface PagedResult<T> {
  Items: T[];
  TotalRecords: number;
  PageNumber: number;
  PageSize: number;
}
