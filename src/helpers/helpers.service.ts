import { STATUSES } from '@/constants';
import { ApiResponse } from '@/types';
import { HttpStatusCode, HttpStatusCodes } from '@/utils';
import { Injectable } from '@nestjs/common';
import { validate as isUUIDValid } from 'uuid';

@Injectable()
export class HelpersService {
  createResponse<T>(
    message: string,
    data: T | null = null,
    error: string | null = null,
    statusCode: HttpStatusCode = HttpStatusCodes.OK,
  ): ApiResponse<T> {
    return {
      message,
      data,
      error,
      statusCode,
    };
  }

  isValidUUID(id: string): boolean {
    return isUUIDValid(id);
  }

  isInitOrderStatus(name: string, code: string): boolean {
    return STATUSES.some(
      (status) => status.name === name && status.code === code,
    );
  }
}
