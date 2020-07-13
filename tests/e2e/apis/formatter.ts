// import * as router from 'koa-swagger-decorator';
import * as router from "../../../src/";

@router.tagsAll(["Formatter"])
@router.prefix("/formatter")
export default class Formatter {
  @router.formatter((ctx, res) => res.map((a) => a * 2))
  @router.route(router.GET, "/a")
  @router.summary(".")
  static async a(ctx) {
    return [1, 2, 3, 4];
  }

  @router.requests(router.GET, "/b")
  @router.summary(".")
  static async b(ctx) {
    return {
      name: "colin",
      age: 28,
    };
  }
}
