import { SwaggerRouter } from 'koa-swagger-decorator';
import { Config } from './utils';
declare type RouterWithConfig = SwaggerRouter & {
    config?: Config;
};
export default function (config: Config): RouterWithConfig;
export {};
