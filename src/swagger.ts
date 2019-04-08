import * as fs from 'fs';
import * as path from 'path';
import * as merge from 'merge';
import { SwaggerRouter } from 'koa-swagger-decorator';
import {Config} from './decorators';

type RouterWithConfig = SwaggerRouter & {config?: Config};
/**
 * 读取 package.json
 */
function readPkg(pkgFile: string) {
  let pkg;

  if (fs.existsSync(pkgFile)) {
    pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
  } else {
    pkg = {}
  }

  return pkg;
}

export default function(config: Config): RouterWithConfig {
  let pkg;
  let swaggerConfig;


  if (config.packageFile) {
    pkg = readPkg(config.packageFile);
  } else {
    pkg = {};
  }

  const defaultConf = {
    title: pkg.name ? `API Doc of ${pkg.name}` : 'API Docs',
    description: pkg.description || '',
    version: pkg.version || '',
    prefix: '/',
    // swaggerHtmlEndpoint: '/swagger',
    // swaggerJsonEndpoint: '/swagger-json',

    // [optional] additional options for building swagger doc eg. add api_key as
    // shown below
    swaggerOptions: {
      // swagger: '3.0.0',
      // openapi: '3.0.0',
      securityDefinitions: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization'
        }
      }
    },

    swaggerConfiguration: {
      display: {
        defaultModelsExpandDepth: 4,
        defaultModelExpandDepth: 3,
        docExpansion: 'list',
        defaultModelRendering: 'model'
      }
    }
  };

  swaggerConfig = merge.recursive(true, defaultConf, config.swaggerConfig);

  const swaggerRouter: RouterWithConfig = new SwaggerRouter({prefix: swaggerConfig.prefix}, swaggerConfig);

  swaggerRouter.swagger();

  // mapDir will scan the input dir, and automatically call router.map to all Router Class
  swaggerRouter.mapDir(config.controllersDir, {
    // default: true, // . To recursively scan the dir to make router. If false, will not scan subroutes dir
    recursive: true,
    // default: true, // if true, you can call ctx.validatedBody[Query | Params] to get validated data.
    doValidation: false,
  });

  swaggerRouter.config = swaggerConfig;

  return swaggerRouter;
}
