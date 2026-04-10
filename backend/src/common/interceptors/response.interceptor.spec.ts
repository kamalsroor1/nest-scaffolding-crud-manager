import { ResponseInterceptor } from './response.interceptor';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap data in success envelope', (done) => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as any;
    const mockCallHandler = {
      handle: () => of({ foo: 'bar' }),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Request successful',
        data: { foo: 'bar' },
        meta: null,
      });
      done();
    });
  });
});
