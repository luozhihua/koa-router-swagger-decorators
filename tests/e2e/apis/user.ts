// import * as router from 'koa-swagger-decorator';
import * as router from '../../../src/';

const Tag = router.tags(['USER']);

@router.prefix('/users')
export default class User {
  @Tag
  @router.request(router.GET, '/users')
  @router.summary('check service health.')
  static async users(ctx) {
    return 'users!'
  }

  @Tag
  @router.request(router.GET, '/profile')
  @router.summary('check service health.')
  static async profile(ctx) {
    return 'profile!'
  }

  @Tag
  @router.request(router.GET, '/details/{id}')
  @router.path({id: {type: 'string'}})
  @router.summary('check service health.')
  static async details(ctx) {
    return `details of ${ ctx.params.id }!`
  }
}
