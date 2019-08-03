import { HttpResponse } from './../../../src/decorators';
// import * as router from 'koa-swagger-decorator';
import * as router from '../../../src';

const Tag = router.tags(['TEST']);

@router.prefix('/')
export default class RootPath {
  @Tag
  @router.request(router.GET, '/list')
  @router.summary('check service health.')
  static async list(ctx) {
    return 'list!'
  }

  @Tag
  @router.request(router.GET, '/list2')
  @router.summary('check service health.')
  static async list2(ctx) {
    // return 'list2!'
    return new HttpResponse({list: [1, 2, 3, 4], page: 1, pageSize: 4})
  }

  @Tag
  @router.request(router.GET, '/list3')
  @router.summary('check service health.')
  static async list3(ctx) {
    return new HttpResponse({list: [1, 2, 3, 4], page: 1, pageSize: 4}, '3333333333')
  }

  @Tag
  @router.request(router.GET, '/list4')
  @router.summary('check service health.')
  static async list4(ctx) {
    return new HttpResponse({list: [1, 2, 3, 4], page: 1, pageSize: 4}, '4444444444', 301, false)
  }
}
