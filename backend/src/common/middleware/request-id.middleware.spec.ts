import { RequestIdMiddleware } from './request-id.middleware';
import { Request, Response } from 'express';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
    mockRequest = {};
    mockResponse = {
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should attach a requestId to the request object', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockRequest['requestId']).toBeDefined();
    expect(typeof mockRequest['requestId']).toBe('string');
  });

  it('should set the X-Request-ID header on the response', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    const requestId = mockRequest['requestId'];
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', requestId);
  });

  it('should call next()', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });
});
