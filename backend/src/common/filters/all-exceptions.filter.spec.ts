// ===========================================
// AllExceptionsFilter Unit Tests
// ===========================================

import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/test',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    filter = new AllExceptionsFilter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('catch', () => {
    it('should handle HttpException with status and message', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Not Found',
          error: 'Error',
          path: '/api/test',
        }),
      );
    });

    it('should handle HttpException with object response (validation errors)', () => {
      const exception = new HttpException(
        {
          message: ['email must be a string', 'name is required'],
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: ['email must be a string', 'name is required'],
          error: 'Bad Request',
        }),
      );
    });

    it('should handle generic Error with 500 status', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const exception = new Error('Database connection failed');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error',
          error: 'Internal Server Error',
        }),
      );
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle unknown error (non-Error, non-HttpException)', () => {
      filter.catch('some string error', mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error',
          error: 'Internal Server Error',
        }),
      );
    });

    it('should include timestamp and path in response', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.timestamp).toBeDefined();
      expect(responseBody.path).toBe('/api/test');
      // Timestamp should be a valid ISO string
      expect(new Date(responseBody.timestamp).getTime()).not.toBeNaN();
    });
    it('should handle HttpException with null response object values', () => {
      const exception = new HttpException(
        { message: null, error: null },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});
