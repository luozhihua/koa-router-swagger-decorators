// import * as router from 'koa-swagger-decorator';
import { Context } from "koa";
import * as router from "../../../../src";
import { pick } from "lodash";

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

  @router.route(router.POST, "/file/image/size/2m")
  @router.summary("validate max size of uploads image.")
  @router.formData({
    file: { type: "file", required: true, format: "image", maxSize: "2M" },
  })
  static async uploadImageSize2m(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }

  @router.route(router.POST, "/file/image/resolution/1024")
  @router.summary("validate max resolution of uploads image")
  @router.formData({
    file: { type: "file", format: "image", maxResolution: "1024" },
  })
  static async uploadImageResolution(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }

  @router.route(router.POST, "/file/image/mimes/png")
  @router.summary("validate max resolution of uploads image")
  @router.formData({
    file: { type: "file", format: "image", mimes: "image/png;" },
  })
  static async uploadImageMimes_png(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }

  @router.route(router.POST, "/file/image/mimes/jpeg")
  @router.summary("validate max resolution of uploads image")
  @router.formData({
    file: { type: "file", format: "image", mimes: "image/jpeg;" },
  })
  static async uploadImageMimes_jpg(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }

  @router.route(router.POST, "/file/image/mimes")
  @router.summary("validate max resolution of uploads image")
  @router.formData({
    file: { type: "file", format: "image", mimes: "image/png;image/jpg;" },
  })
  static async uploadImageMimes(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }

  @router.route(router.POST, "/file/image/exts/jpg")
  @router.summary("validate max resolution of uploads image")
  @router.formData({
    file: { type: "file", format: "image", extnames: ".jpg" },
  })
  static async uploadImageExtsJpg(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }

  @router.route(router.POST, "/file/image/exts/png")
  @router.summary("validate max resolution of uploads image")
  @router.formData({
    file: { type: "file", format: "image", extnames: [".png"] },
  })
  static async uploadImageExtsPng(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }

  @router.route(router.POST, "/file/image/exts/png-jpeg")
  @router.summary("validate max resolution of uploads image")
  @router.formData({
    file: { type: "file", format: "image", extnames: [".png", ".jpeg"] },
  })
  static async uploadImageExtsPng_jpeg(ctx: Context) {
    ctx.status = 200;
    return "ok";
  }
}
