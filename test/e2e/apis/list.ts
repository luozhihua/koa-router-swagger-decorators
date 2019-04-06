import * as decorators from '../../../src';
const Tag = decorators.tags(['TEST']);

@decorators.router('/')
export default class Health {
  @Tag
  @decorators.request(decorators.GET, '/list')
  @decorators.summary('check service health.')
  static async handler(ctx) {
    return 'oks!'
  }
}
