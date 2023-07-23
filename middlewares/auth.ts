import BaseError from "../error/base-error";
import TokenError from "../error/token-error";
import JsonWebToken from "jsonwebtoken";
import * as HttpStatus from "../config/constants/http-status";
import { AuthMidd } from "./auth.types";
import { TokenPayload } from "../utils/token.types";
import { httpStatusText } from "../utils/http";
import { BaseErrorProps, ErrorType } from "../error/index.types";

const Auth: AuthMidd = (roles) => (req, res, next) => {
  const appId = req.headers["app-id"];
  const author = req.headers.authorization;
  const token = author?.split(" ")[1];

  const errorType = ErrorType.TokenError;
  const httpCode = HttpStatus.UNAUTHORIZED;
  const httpStatus = httpStatusText(httpCode);
  const error: BaseErrorProps = { errorType, httpCode, httpStatus };

  try {
    // check token
    if (!token) {
      error.errorCode = "missing_parameter";
      throw new BaseError(error);
    }

    // verify token
    const decoded = JsonWebToken.verify(
      token,
      process.env.TOKEN_SECRET as JsonWebToken.Secret
    ) as TokenPayload;

    // check `appId` is matched with decoded token
    if (appId !== decoded.iss) {
      error.errorCode = "an_error_occurred";
      throw new BaseError(error);
    }

    // check specific role
    if (roles.length && !roles.includes(decoded.role)) {
      error.errorCode = "invalid_role";
      throw new BaseError(error);
    }

    // assign token decoded to `req.jwt`
    req.jwt = decoded;

    next();
  } catch (error) {
    if (error instanceof BaseError) {
      next(error);
      return;
    }

    const tokenError = new TokenError(error);
    next(tokenError);
  }
};

export default Auth;
