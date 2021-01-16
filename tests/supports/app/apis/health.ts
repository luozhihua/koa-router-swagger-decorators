import * as router from "../../../../src";
import { Context } from "koa";

@router.tagsAll(["Health"])
@router.prefix("/health")
export default class Health {
  @router.route(router.GET, "/alive")
  @router.summary("check service health.")
  static async alive(_ctx: Context) {
    return "ok! 1";
  }

  @router.route(router.GET, "/ready")
  @router.summary("check service health.")
  static async ready(_ctx: Context) {
    return "ok!";
  }
}
