
import { Context } from 'koa';

export type AllowedMethods = 'get' | 'post' | 'put' | 'delete' |  'patch' | 'option';
export const GET: AllowedMethods = 'get';
export const POST: AllowedMethods = 'post';
export const DELETE: AllowedMethods = 'delete';
export const PUT: AllowedMethods = 'put';
export const PATCH: AllowedMethods = 'patch';
export const OPTION: AllowedMethods = 'option';

export interface SwaggerConfig {}

export interface Config {
  controllersDir: string;
  packageFile: string;
  swaggerConfig?: SwaggerConfig;


  /**
   * 是否自动扫描 controllerDir 所指定目录的子目录; default: true;
   */
  recursive?: boolean;

  /**
   * 是否自动验证请求的 body/query/params;
   * 如果验证不通过则会返回 400 Bad request;
   * default: true
   */
  validatable?: boolean;
  beforeController?: (ctx: Context) => Promise<any>;
  afterController?: (ctx: Context) => any;
  formatter?: (ctx: Context, result: any) => any;
}

export interface ResponseData {
  status: number;
  message: string;
  success: boolean;
  data: any;
  errorCode?: number;
}

export interface KoaRouterConfig {
  controllersDir: string;
  packageFile: string;
  swaggerConfig?: SwaggerConfig;
}

/**
 * 指定 Http 状态码的异常类
 */
export class HttpStatusError extends Error {
  public status: number;
  public errorCode: number;

  constructor(status: number, message: string, errorCode?: number) {
    super(message);
    this.status = status;
    this.errorCode = errorCode || 0;
  }
}

export class HttpResponse {
  public data: any;
  public status?: number = 200;
  public message?: string = '';
  public success?: boolean = true;
  public errorCode?: number = 0;

  constructor(options: Pick<HttpResponse, 'data' | 'status' | 'errorCode' | 'message' | 'success'>) {
    let { data, message = '', status = 200, success = true, errorCode = 0} = options;

    this.data = data;
    this.status = status;
    this.message = message;
    this.success = success;
  }
}

export function defaultFormatter(ctx: Context, result: any): any {
  if (result && typeof result.data === 'undefined' && typeof result.success === 'undefined') {
    return new HttpResponse({
      data: result,
      message: ctx.message || ctx.state.message || '',
      status: 200,
      errorCode: ctx.state.errorCode || 0,
      success: true,
    });
  } else if (!result) {
    return new HttpResponse({
      data: ctx.body || null,
      message: ctx.message || ctx.state.message || '',
      status: 200,
      errorCode: ctx.state.errorCode || 0,
      success: true,
    });
  } else {
    return result;
  }
}
