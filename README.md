# jaeger-koa-prisam-basic

koa, prisma에 jaeger(예거 적용)

```
yarn add koa koa-router
yarn add -D typescript ts-node nodemon
yarn add -D @types/koa @types/koa-router
yarn add -D prisma
yarn add -D @opentelemetry/tracing @opentelemetry/exporter-collector @opentelemetry/resources

yarn add -D @opentelemetry/instrumentation-koa @opentelemetry/instrumentation-http @opentelemetry/instrumentation @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-jaeger @opentelemetry/sdk-trace-node @opentelemetry/propagator-ot-trace @opentelemetry/sdk-node
```



```
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:1.47
```

https://www.prisma.io/blog/tracing-tutorial-prisma-pmkddgq1lm2
