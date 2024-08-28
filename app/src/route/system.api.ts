// import { init } from '../tracing'
// init('demo-node-service', 'development') // calling tracer with 
import * as Router from 'koa-router'
import { createClient } from 'redis'
import axios from 'axios'
const client = createClient({
    url: 'redis://localhost:6379'
})
client.on('error', err => console.log('Redis Client Error', err))

const router = new Router()

router.get('/redis', async (ctx, next) => {
    await client.connect()
    await client.set('key', 'redis-jaeger')
    const value = await client.get('key')
    await client.disconnect()

    ctx.body = value
})

router.get('/ping', async (ctx, next) => {
    const { data: result } = await axios.get('http://localhost:8080/api/ping')
    console.log(result)
    ctx.body = result
})

router.get('/foo/bar', async (ctx, next) => {
    const foo = {} as any
    // foo.bar is not a function
    foo.bar()
})

export default router