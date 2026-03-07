import { AppError } from "@/shared/lib/errors/app-error";

export class AuthenticationError extends AppError {
  constructor(
    message = "Authentication required. Please log in.",
    code = "AUTHENTICATION_REQUIRED",
  ) {
    super({ code, isOperational: true, message, statusCode: 401 });
  }
}
