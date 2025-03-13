import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import User from '../models/user.model.js';
import { userResponseDto } from '../dto/user.response.dto.js';

/*const bcrypt = import('bcryptjs');
const jwt = import('jsonwebtoken');*/

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(
        res,
        'Invalid email or password',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (user.password !== password) {
      return errorResponse(
        res,
        'Invalid email or password',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return successResponse(
      res,
      'Login Successful',
      HTTP_STATUS.OK,
      userResponseDto(user),
    );
  } catch (e) {
    return errorResponse(
      res,
      'Internal Server Error',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};
