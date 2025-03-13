export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

export const successResponse = (
  res,
  message,
  status = HTTP_STATUS.OK,
  result = null,
) => {
  res.status(status).json({ success: true, message, result });
};

export const errorResponse = (res, message, status, result = null) => {
  res.status(status).json({ success: false, message, result });
};
