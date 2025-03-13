import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import User from '../models/user.model.js';
import { userLoginResponseDTO } from '../dto/user.response.dto.js';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from '../middleware/jwt.middleware.js';

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

    const is_password_correct = comparePassword(password, user.password);

    if (!is_password_correct) {
      return errorResponse(
        res,
        'Invalid email or password',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const accessToken = generateAccessToken(user);
    user.refreshToken = generateRefreshToken(user);
    user.save();

    return successResponse(
      res,
      'Login Successful',
      HTTP_STATUS.OK,
      userLoginResponseDTO(user, accessToken),
    );
  } catch (e) {
    return errorResponse(
      res,
      'Internal Server Error',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};
