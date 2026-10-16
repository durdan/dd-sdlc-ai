---
id: spring-actuator
title: Actuator and observability
summary: Health checks, metrics and traces, mostly for free
why: When something is slow at 3 a.m., the numbers Actuator and Micrometer already collect are what tell you which hop to blame.
requires: [spring-config]
lesson: none
points:
  - title: Endpoints, carefully exposed
    text: Actuator adds /actuator endpoints, but only health is exposed over HTTP by default; expose the rest on purpose.
  - title: Liveness is not readiness
    text: Liveness says the process should be restarted; readiness says it should not get traffic right now.
  - title: Micrometer is the facade
    text: Code records to Micrometer once; a registry ships the numbers to Prometheus, Datadog, OTLP or others.
  - title: Observations give both
    text: One Observation produces a timer metric and, with tracing on, a span that carries the trace id across services.
quiz_hint: Separate what tells an orchestrator to restart from what tells it to stop sending traffic.
quiz:
  - q: You add spring-boot-starter-actuator. Which endpoints can you call over HTTP without further configuration?
    options:
      - All of them
      - Only /actuator/health
      - None until you add Spring Security
    answer: 1
    explain: Endpoints can reveal sensitive data, so Boot exposes only health over HTTP by default. management.endpoints.web.exposure.include adds others, such as info, metrics or prometheus.
  - q: The database is down. Should the liveness probe fail?
    options:
      - Yes, so Kubernetes restarts the pod
      - No; restarting will not fix the database. Readiness can report it so traffic goes elsewhere, liveness should stay up
      - Both probes should be removed
    answer: 1
    explain: A failing liveness probe restarts the container, which only adds load and churn when a shared dependency is down. Keep external checks out of liveness; readiness is where they belong, if anywhere.
  - q: What does Spring Boot record for every Spring MVC request with Actuator on the classpath?
    options:
      - Nothing until you annotate controllers with @Timed
      - A timer named http.server.requests, tagged with method, uri template, status and outcome
      - Only a count of errors
    answer: 1
    explain: Boot instruments MVC through the Observation API. The uri tag is the template (/orders/{id}), not the raw path, which keeps the number of time series bounded.
links:
  - title: Actuator endpoints (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/actuator/endpoints.html
  - title: Metrics (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/actuator/metrics.html
  - title: Observability (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/actuator/observability.html
  - title: Tracing (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/actuator/tracing.html
---
Spring Boot Actuator adds production features under `/actuator`: health checks, metrics, info about the build, the conditions report, thread dumps and more. Behind the metrics is Micrometer, a vendor-neutral facade: Boot instruments HTTP requests, the JVM, the connection pool and more, and a registry you choose ships the numbers to Prometheus, Datadog, an OTLP collector or something else. Since Boot 3, the same instrumentation also produces distributed traces through the Micrometer Observation API.

## Expose with intent

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  endpoint:
    health:
      show-details: when-authorized   # default: never
      probes:
        enabled: true                 # on automatically when running on Kubernetes
  server:
    port: 8081                        # keep management traffic off the public port
```

Only `health` is exposed over HTTP by default. Add what you need, and protect or isolate the rest; `env`, `heapdump` and `loggers` can reveal secrets or change behaviour.

## Health, liveness and readiness

`/actuator/health` aggregates `HealthIndicator`s: the database, disk space, message brokers and your own. On Kubernetes, Boot also exposes two health groups:

- `/actuator/health/liveness`: is the application's internal state broken beyond repair? If this fails, the container is restarted.
- `/actuator/health/readiness`: can it take traffic now? If this fails, the pod is taken out of the load balancer until it recovers.

By default neither group includes external checks such as the database, and that is deliberate: if a shared database is down, restarting every instance helps nobody. You can add an indicator to readiness with `management.endpoint.health.group.readiness.include=readinessState,db` if traffic really should drain.

## Metrics

Things you get without writing code include `http.server.requests` (a timer per method, URI template, status and outcome), `jvm.memory.used`, `jvm.gc.pause`, `hikaricp.connections.*`, `tomcat.sessions.*` and executor metrics. Your own are a few lines:

```java
@Component
class CheckoutMetrics {
  private final Counter declined;
  CheckoutMetrics(MeterRegistry registry) {
    declined = Counter.builder("checkout.payments.declined")
        .tag("provider", "stripe")
        .register(registry);
  }
  void onDeclined() { declined.increment(); }
}
```

Keep tag values bounded. A tag holding a user id or a raw URL creates a new time series per value and can overwhelm the metrics backend.

## Observations and traces

An `Observation` wraps a piece of work once and feeds several handlers: a timer for metrics and, when a tracer such as Micrometer Tracing with an OpenTelemetry or Brave bridge is on the classpath, a span.

```java
Observation.createNotStarted("inventory.reserve", registry)
    .lowCardinalityKeyValue("warehouse", warehouseId)
    .observe(() -> inventory.reserve(order));
```

Boot propagates the trace context on outgoing calls made with the auto-configured `RestClient.Builder`, `RestTemplateBuilder` or `WebClient.Builder`, and can put the trace id into every log line, so one slow checkout can be followed from the gateway through each service to the query that took the time.
