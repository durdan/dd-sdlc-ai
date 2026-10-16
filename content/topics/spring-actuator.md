---
id: spring-actuator
title: Actuator and observability
summary: Health checks, metrics and traces, mostly for free
why: When something is slow at 3 a.m., the numbers Actuator and Micrometer already collect are what tell you which hop to blame.
requires: [spring-config]
lesson: diagram
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

```trace diagram
id: scrape-and-probe
title: A scrape and two probes
subtitle: From a meter in your code to an alert, and how Kubernetes asks after the pod
direction: DOWN
groups:
  - { id: app, label: Spring Boot app (one pod) }
  - { id: k8s, label: Kubernetes }
elements:
  - { id: code, label: Your code, sub: checkout.payments.declined, group: app, row: 0 }
  - { id: auto, label: Boot instrumentation, sub: "http.server.requests, jvm, hikaricp", group: app, row: 0 }
  - { id: registry, label: MeterRegistry, sub: "Micrometer, Prometheus registry", group: app, tone: stream, row: 1 }
  - { id: scrape, label: /actuator/prometheus, sub: on the management port, group: app, row: 2 }
  - { id: liveness, label: /actuator/health/liveness, sub: LivenessState only, group: app, row: 2 }
  - { id: readiness, label: /actuator/health/readiness, sub: ReadinessState by default, group: app, row: 2 }
  - { id: prometheus, label: Prometheus, sub: stores time series, kind: store, tone: data, row: 3 }
  - { id: alertmanager, label: Alertmanager, sub: notifies on-call, kind: external, row: 4 }
  - { id: kubelet, label: kubelet, sub: probes each container, group: k8s, row: 3 }
  - { id: endpoints, label: Service endpoints, sub: pods that get traffic, group: k8s, row: 4 }
edges:
  - { id: inc, from: code, to: registry, label: increment() }
  - { id: time, from: auto, to: registry, label: record timings }
  - { id: render, from: registry, to: scrape }
  - { id: pull, from: scrape, to: prometheus, label: "pulled every scrape interval" }
  - { id: fire, from: prometheus, to: alertmanager, label: alert rule fires }
  - { id: live, from: liveness, to: kubelet, label: 200 or 503 }
  - { id: ready, from: readiness, to: kubelet, label: 200 or 503 }
  - { id: drain, from: kubelet, to: endpoints, label: "not ready: take the pod out", style: dashed }
steps:
  - caption: Your code records to Micrometer once. This counter goes up every time a payment is declined, and the code never mentions Prometheus.
    focus: [code, registry]
    trace: [inc]
  - caption: Boot has already instrumented the rest. Every Spring MVC request records into the http.server.requests timer, tagged with method, URI template, status and outcome, next to JVM and connection pool meters.
    focus: [auto, registry]
    trace: [time]
  - caption: With the Prometheus registry on the classpath and the endpoint exposed, /actuator/prometheus renders every meter in the format Prometheus expects, each time it is asked. Only health is exposed by default.
    focus: [registry, scrape]
    trace: [render]
  - caption: Prometheus pulls. On every scrape interval it GETs that endpoint from each instance and stores the numbers as time series. Keep tag values bounded, or every user id becomes a series of its own.
    focus: [prometheus, scrape]
    trace: [pull]
  - caption: An alert rule, say the share of 5xx responses over five minutes, is evaluated in Prometheus. When it fires, Alertmanager groups, silences or routes it and notifies whoever is on call.
    focus: [prometheus, alertmanager]
    trace: [fire]
  - caption: Separately, Kubernetes asks after the pod. The kubelet calls the liveness group over HTTP. It answers 503 only when the application's own state is broken, and after enough failures in a row the container is restarted.
    focus: [kubelet, liveness]
    trace: [live]
  - caption: The readiness group answers whether the pod should get traffic now. During start-up and graceful shutdown it reports REFUSING_TRAFFIC.
    focus: [kubelet, readiness]
    trace: [ready]
  - caption: A failing readiness probe takes the pod out of the Service's endpoints, with no restart. It comes back when the probe passes again.
    focus: [readiness, endpoints]
    trace: [drain]
  - caption: Neither group checks the database by default. If a shared database is down, restarting every pod helps nobody; add it to readiness only if traffic really should drain.
    focus: [liveness, readiness]
```
