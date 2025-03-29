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
  data = null,
) => {
  res.status(status).json({ success: true, message, data });
};

export const errorResponse = (res, message, status, data = null) => {
  res.status(status).json({ success: false, message, data });
};
