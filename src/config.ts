import { Context } from "koa";

export type ResponseFormatter = (ctx: Context, result: any) => any;

export interface SwaggerConfig {}

export interface KoaRouterConfig {
  controllersDir: string;
  packageFile: string;
  swaggerConfig?: SwaggerConfig;
}

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
  validation?: <T = boolean>(
    ctx: Context,
    target: any,
    name: string
  ) => Promise<T>;
  beforeController?: (ctx: Context, target: any, name: string) => Promise<any>;
  afterController?: (ctx: Context, target: any, name: string) => Promise<any>;
  formatter?: ResponseFormatter;
}

export const config: Config = {
  controllersDir: "",
  packageFile: "",
  validatable: false,
};
