import * as path from 'path';
import * as Koa from 'koa';
import createRouter from '../../src';

const app = new Koa();

const router =  createRouter({
  controllersDir: path.resolve(__dirname, './apis'),
  packageFile: path.resolve(__dirname, './package.json'),
  swaggerConfig: {
    prefix: '/api',
  },
});

const routes: any = router.routes();
const methods = router.allowedMethods();

app.use(routes);
app.use(methods);
app.listen(6789);

console.log('App listen on port : 6789');

