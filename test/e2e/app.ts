import * as path from 'path';
import * as Koa from 'koa';
import Router from '../../src/router';

export default async function start() {
  const app = new Koa();
  const router = await Router({
    controllersDir: path.resolve(__dirname, './apis'),
    packageFile: path.resolve(__dirname, './package.json'),
    swaggerConfig: {}
  });
  
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen(6789);
  console.log('App listen on port : 6789');
}

start();