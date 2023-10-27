export const OK = 200;
export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;
export const INTERNAL_SERVER_ERROR = 500;

interface ErrorCodeToHttp {
  [k: number]:
    | typeof OK
    | typeof BAD_REQUEST
    | typeof UNAUTHORIZED
    | typeof FORBIDDEN
    | typeof NOT_FOUND
    | typeof INTERNAL_SERVER_ERROR;
}

export const ERROR_CODE_TO_HTTP: ErrorCodeToHttp = {
  //    Login
  1001: BAD_REQUEST,
  1002: BAD_REQUEST,
  1003: BAD_REQUEST,
  1004: BAD_REQUEST,
  //    SignUp
  1100: BAD_REQUEST,
  1101: BAD_REQUEST,
  1102: BAD_REQUEST,
  //    Documents Querying
  1200: BAD_REQUEST,
  1201: BAD_REQUEST,
  1202: BAD_REQUEST,
  //    Authorization
  2000: UNAUTHORIZED,
  2001: UNAUTHORIZED,
  2002: UNAUTHORIZED,
  2003: UNAUTHORIZED,
  2004: UNAUTHORIZED,
  2005: UNAUTHORIZED,
  2006: UNAUTHORIZED,
  2007: UNAUTHORIZED,
  //    Other Server Logic Errors
} as const;
