export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Counters {
  incomingPendingRequests: number;
  myActiveRequests: number;
}
