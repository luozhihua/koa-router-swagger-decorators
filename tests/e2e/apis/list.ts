// import * as router from 'koa-swagger-decorator';
import * as router from '../../../src';

function logAll(options: router.DecoratorWrapperOptions = {}) {
  return function(target) {
    router.wrapperAll(target, {
      async before(ctx) {
        console.log('BEFORE ALL.');

        if (ctx.path.indexOf('list2') !== -1) {
          throw new Error('list threw error in before all hook.')
        }
      },
      ...options,
    });
  }
}

// @router.queryAll({ xyz: { type: 'string', required: true} })
@router.prefix('/doc')
@logAll({excludes: ['list3']})
@router.tagsAll(['List'])
export default class RootPath {
  @router.request(router.POST, '/list/:id?')
  @router.summary('get list 1.')
  @router.query({ aquery: { type: 'string', default: '2' }})
  @router.path({ id: { type: 'string', default: '2' }})
  @router.responses({  })
  @router.body({ abody: { type: 'string', default: 'abc', }})
  @router.description('sdasasd')
  @router.params('asd', { abcxx: { type: 'string' }})
  static async list(ctx) {
    return 'list!'
  }

  @router.request(router.GET, '/list2')
  @router.summary('get list 2.')
  static async list2(ctx) {
    // return 'list2!'
    return new router.HttpResponse({ data: {list: [1, 2, 3, 4], page: 1, pageSize: 4} })
  }

  @router.request(router.GET, '/list3')
  @router.summary('get list 3.')
  static async list3(ctx) {
    return new router.HttpResponse({ data: {list: [1, 2, 3, 4], page: 1, pageSize: 4}, message: '3333333333'})
  }

  @router.tags(['XXXX'])
  @router.summary('get list 4.')
  @router.request(router.GET, '/list4')
  static async list4(ctx) {
    return new router.HttpResponse({
      data: {list: [1, 2, 3, 4, 6], page: 1, pageSize: 4},
      message: '4444444444',
      success: false
    })
  }
}
