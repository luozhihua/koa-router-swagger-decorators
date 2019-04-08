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
    return 'list2!'
  }
}
