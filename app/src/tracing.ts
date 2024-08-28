import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  SpanProcessor,
  BatchSpanProcessor,
  SpanExporter,
  Span,
} from '@opentelemetry/tracing'
import { CollectorTraceExporter, CollectorMetricExporter } from '@opentelemetry/exporter-collector'
import { TraceIdRatioBasedSampler, ParentBasedSampler } from '@opentelemetry/sdk-trace-base'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { KoaInstrumentation, KoaLayerType, KoaRequestInfo } from '@opentelemetry/instrumentation-koa'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { PrismaInstrumentation } from '@prisma/instrumentation';
// import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis'
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis-4'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { OTTracePropagator } from '@opentelemetry/propagator-ot-trace'
import { MeterProvider } from '@opentelemetry/sdk-metrics-base';
import * as api from '@opentelemetry/api'

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const hostName = process.env.OTEL_TRACE_HOST || 'localhost'

const options = {
  url: `http://${hostName}:4318/v1/traces`, // url is optional and can be omitted - default is http://localhost:4318/v1/traces
  headers: {}, // an optional object containing custom headers to be sent with each request
  concurrencyLimit: 10, // an optional limit on pending requests
};

// const options = {
//   tags: [] as any,
//   endpoint: `http://${hostName}:4318`,
//   // endpoint: `http://${hostName}:14278/api/traces`,
// }

export const init = (serviceName: string, environment: string) => {
  const traceRatio = 1
  // const traceRatio = process.env.NODE_ENV === 'production' ? 0.1 : 1.0;
  // User Collector Or Jaeger Exporter
  //const exporter = new CollectorTraceExporter(options)
  
  const metricExporter = new CollectorMetricExporter({
      url: 'http://localhost:4318/v1/metrics'
  })
  const meter = new MeterProvider({ exporter: metricExporter, interval: 100000 }).getMeter(serviceName);


  // const exporter = new JaegerExporter(options) as any
  const exporter = new OTLPTraceExporter(options) as any
  // const exporter = new JaegerExporter({ endpoint: 'http://localhost:14268/api/traces'}) as any;
    
  const provider = new NodeTracerProvider({
    // sampler: new ParentBasedSampler({
    //   root: new TraceIdRatioBasedSampler(1)
    // }),
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName, // Service name that showuld be listed in jaeger ui
      // [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
    }),
  })

  //provider.addSpanProcessor(new SimpleSpanProcessor(exporter))

  // Use the BatchSpanProcessor to export spans in batches in order to more efficiently use resources.
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter) as any)
  // provider.addSpanProcessor(new BatchSpanProcessor(exporter) as any)

  // Enable to see the spans printed in the console by the ConsoleSpanExporter
  // provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter())) 

  provider.register()
  // provider.register({ propagator: new OTTracePropagator() })

  console.log('tracing initialized')

  registerInstrumentations({
    instrumentations: [
      new RedisInstrumentation(),
      new PrismaInstrumentation(),
      new KoaInstrumentation({
        // ignoreLayersType: [KoaLayerType.MIDDLEWARE],
        // ignoreLayersType: [KoaLayerType.ROUTER],
        requestHook: function (span: Span, info: KoaRequestInfo) {
          span.setAttribute(
            'http.method',
            info.context.request.method
          )
          span.setAttribute(
            'http.header',
            JSON.stringify(info.context.request.headers)
          )
        },
      }),
      new HttpInstrumentation({
        responseHook: function(span: Span, response: any) {
          span.setAttribute(
            'http.response',
            response
          )
        }
      }),
    ],
  })
  
  const tracer = provider.getTracer(serviceName)
  return { meter, tracer }
}

// export function getMiddlewareTracer(tracer: api.Tracer) {
//   return (req: any, res: any, next: any) => {
//     const span = tracer.startSpan(`express.middleware.tracer(${req.method} ${req.path})`, {
//       kind: api.SpanKind.SERVER,
//     });

//     // End this span before sending out the response
//     const originalSend = res.send;
//     res.send = function send(...args: any[]) {
//       span.end();
//       originalSend.apply(res, args);
//     };

//     api.context.with(api.trace.setSpan(api.ROOT_CONTEXT, span), next);
//   };
// }

export function errorTracer(tracer: api.Tracer) {
  return async (ctx: any, next: any) => {
    try {
      await next()
      if(ctx.body) {
        const span = api.trace.getSpan(api.context.active())
        if(typeof ctx.body === 'string') {
          span.setAttribute('ctx.body', (ctx.body));
        } else {
          span.setAttribute('ctx.body', JSON.stringify(ctx.body));
        }
      }
    } catch(err) {
      console.error('Caught error', err.message);
      const span = api.trace.getSpan(api.context.active())
  
      if (span) {
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: err.message });
      }
      ctx.status = 500
    }
  }
}