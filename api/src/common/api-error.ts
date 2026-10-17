import { HttpException, HttpStatus } from '@nestjs/common';

// Errors the app understands: always { code } so the app can show a translated message.
export class ApiError extends HttpException {
  constructor(code: string, status: HttpStatus) {
    super({ code }, status);
  }
}
