import * as Router from 'koa-router'
import UserApi from './user.api'
import RedisApi from './system.api'

const router = new Router()

router
    .use(UserApi.routes())
    .use(RedisApi.routes())
    .use(router.allowedMethods())

export default router
