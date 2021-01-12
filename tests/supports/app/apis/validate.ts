// import * as router from 'koa-swagger-decorator';
import { Context } from "koa";
import * as router from "../../../../src";

@router.tagsAll(["Validate"])
@router.prefix("/validate")
export default class User {
  @router.route(router.GET, "/get/:id")
  @router.summary("Get user details.")
  @router.path({
    id: { type: "string", required: true, format: "uuid" },
  })
  static async details(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }

  @router.route(router.POST, "/post")
  @router.summary("Create user.")
  @router.body({
    username: { type: "string", required: true, minLength: 4 },
    password: { type: "string", required: true, minLength: 10 },
  })
  static async create(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }

  @router.route(router.POST, "/headers")
  @router.summary("Create user.")
  @router.header({
    "x-user": { type: "string", required: true },
  })
  static async headers(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }
}
