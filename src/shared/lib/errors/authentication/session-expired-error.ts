import { AuthenticationError } from "./authentication-error";

// Sub-class for expired tokens — useful for auth interceptors
export class SessionExpiredError extends AuthenticationError {
  constructor() {
    super("Your session has expired. Please log in again.", "SESSION_EXPIRED");
  }
}
