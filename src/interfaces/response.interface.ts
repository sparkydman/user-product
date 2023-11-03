export interface Pagination {
  page: number;
  next: number;
  prev: number;
  count: number;
}
export interface ResponseMessage {
  isSuccess: boolean;
  message: string;
}
export interface ResponseWithData<T> extends ResponseMessage {
  data: T;
}
export interface ResponseWithList<T> extends ResponseMessage {
  data: T[];
  pagination: Pagination;
}
