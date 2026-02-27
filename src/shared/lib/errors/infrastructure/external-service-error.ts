import { InfrastructureError } from "./infrastructure-error";

export class ExternalServiceError extends InfrastructureError {
  readonly service: string;

  /**
   * @param service - e.g. "stripe", "sendgrid", "aws-s3"
   * @param cause   - original error from the service SDK
   */
  constructor(service: string, cause?: unknown) {
    super({
      code: "EXTERNAL_SERVICE_ERROR",
      message: `External service "${service}" is unavailable`,
      cause,
    });
    this.service = service;
  }
}
