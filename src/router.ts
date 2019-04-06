import * as KoaRouter from 'koa-router';
import { rootRouter } from './decorators';
import swagger from './swagger';

export interface SwaggerConfig {

}
export interface Config {
  controllersDir: string;
  packageFile: string;
  swaggerConfig?: SwaggerConfig;
}

export default (config: Config): KoaRouter => {

  rootRouter.use(swagger(config).routes());

  return rootRouter;
}
