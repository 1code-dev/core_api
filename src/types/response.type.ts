/**
 * @type Response type to be used by all requests while sending the response
 */
export interface TResponse<T> {
  data: T;
  message: string;
  status: number;
}
