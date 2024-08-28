import { init, errorTracer } from './tracing'
const { meter, tracer } = init('demo-node-service', 'development') // calling tracer with 
import * as Koa from 'koa'
import koaBody from 'koa-body'
import router from './route'

const app = new Koa()

const httpCounter = meter.createCounter('http_calls');

app.use(async (ctx, next) => {
    httpCounter.add(1);
    await next();
});

app.use(koaBody())

app.use(errorTracer(tracer))
app.use(router.routes()).use(router.allowedMethods())

app.listen(4000)

console.log('Server running on port 4000')