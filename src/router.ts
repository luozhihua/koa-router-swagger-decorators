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

export default async (config: Config): Promise<KoaRouter> => {
  const router: any = swagger(config);

  rootRouter.use(router.routes());
  return rootRouter;
}
