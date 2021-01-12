import * as path from "path";
import Koa from "koa";
import KoaBody from "koa-body";
import createRouter, { HttpResponse } from "../../../src/index";
import { Server } from "http";

const app = new Koa();
const router = createRouter({
  controllersDir: path.resolve(__dirname, "./apis"),
  packageFile: path.resolve(__dirname, "./package.json"),
  validatable: true,
  swaggerConfig: {
    prefix: "",
  },
  beforeController: async (_ctx) => {
    console.log("before hooks");
  },
  afterController: async (_ctx) => {
    console.log("after hooks");
  },
  formatter: (ctx, result) => {
    if (
      result &&
      typeof result.data === "undefined" &&
      typeof result.success === "undefined"
    ) {
      return new HttpResponse({
        data: result,
        message: ctx.message || ctx.state.message || "",
        status: 200,
        errors: null,
        success: true,
      });
    } else if (!result) {
      return new HttpResponse({
        data: ctx.body || null,
        message: ctx.message || ctx.state.message || "",
        status: 200,
        errors: null,
        success: true,
      });
    } else {
      return result;
    }
  },
});

const routes: any = router.routes();
const methods = router.allowedMethods();

app.use(async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    console.log(err.stack || err);
    let status = err.status || 500;
    let message = err.message || "";
    let body = {
      status,
      message: process.env.NODE_ENV !== "production" ? message : "",
      data: null,
      errors: err.errors || null,
      success: false,
    };

    ctx.status = status;
    ctx.body = body;
  }
});
app.use(KoaBody());
app.use(routes);
app.use(methods);

function start() {
  const port = parseInt(process.env.PORT || "6789");
  const server: Server = app.listen(port);
  console.log(`App listen on port : ${port}`);
  return server;
}

export { app, start };
