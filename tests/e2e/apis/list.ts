import { HttpResponse } from './../../../src/decorators';
// import * as router from 'koa-swagger-decorator';
import * as router from '../../../src';

const Tag = router.tags(['TEST']);

@router.prefix('/')
export default class RootPath {
  @router.request(router.POST, '/list/:id?')
  @Tag
  @router.summary('check service healthxxx.')
  @router.query({ aquery: { type: 'string', default: '2' }})
  @router.path({ id: { type: 'string', default: '2' }})
  @router.responses({  })
  @router.body({ abody: { type: 'string', default: 'abc', }})
  @router.description('sdasasd')
  @router.params('asd', { abcxx: { type: 'string' }})
  static async list(ctx) {
    return 'list!'
  }

  @Tag
  @router.request(router.GET, '/list2')
  @router.summary('check service health.')
  static async list2(ctx) {
    // return 'list2!'
    return new HttpResponse({ data: {list: [1, 2, 3, 4], page: 1, pageSize: 4} })
  }

  @Tag
  @router.request(router.GET, '/list3')
  @router.summary('check service health.')
  static async list3(ctx) {
    return new HttpResponse({ data: {list: [1, 2, 3, 4], page: 1, pageSize: 4}, message: '3333333333'})
  }

  @Tag
  @router.request(router.GET, '/list4')
  @router.summary('check service health.')
  static async list4(ctx) {
    return new HttpResponse({
      data: {list: [1, 2, 3, 4], page: 1, pageSize: 4},
      message: '4444444444',
      status: 301,
      success: false
    })
  }
}
