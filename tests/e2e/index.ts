import * as path from 'path';
import * as Koa from 'koa';
import * as KoaBody from 'koa-body';
import createRouter, {HttpResponse} from '../../src';

const app = new Koa();
const router =  createRouter({
  controllersDir: path.resolve(__dirname, './apis'),
  packageFile: path.resolve(__dirname, './package.json'),
  swaggerConfig: {
    prefix: '/api',
  },
  beforeController: async (ctx) => {
    console.log('before hooks')

  },
  afterController: async (ctx) => {
    console.log('after hooks')
  },
  formatter: (ctx, result) => {
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
});

const routes: any = router.routes();
const methods = router.allowedMethods();

app.use(async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    console.log(err.stack || err);
    let status = err.status || 500;
    let message = err.message || '';
    let body = {
      status,
      message: process.env.NODE_ENV !== 'production' ? message : '',
      data: null,
      code: err.code || ctx.state.errorCode,
      success: false,
    };

    ctx.status = status;
    ctx.body = body;
  }
});
app.use(KoaBody());
app.use(routes);
app.use(methods);
app.listen(6789);

console.log('App listen on port : 6789');

