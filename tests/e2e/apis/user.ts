// import * as router from 'koa-swagger-decorator';
import * as router from '../../../src/';

@router.tagsAll(['USER'])
@router.queryAll({ limit: {type: 'number', required: true, default: 231}})
@router.prefix('/users')
export default class User {
  @router.request(router.GET, '/users ')
  @router.summary('Get user list.')
  static async users(ctx) {
    ctx.status = 401;
    return ['Colin', 'Penny', 'Jones']
  }

  @router.request(router.GET, '/profile')
  @router.summary('Get user profiles.')
  static async profile(ctx) {
    return {
      name: 'colin',
      age: 28,
    }
  }

  @router.request(router.GET, '/details/{id}')
  @router.path({id: {type: 'string'}})
  @router.summary('Get user details.')
  static async details(ctx) {
    return `details of ${ ctx.params.id }!`
  }
}
