---
id: spring-filters
title: Filters, interceptors and AOP proxies
summary: Three ways to run code around your code
why: Logging, auth, tenancy and timing all need to wrap requests or method calls; choosing the wrong layer means it runs too late, too often or not at all.
requires: [spring-request, spring-beans]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Filters wrap everything
    text: Servlet filters see every request, including static files and errors, before Spring MVC has chosen a handler.
  - title: Interceptors know the handler
    text: HandlerInterceptors run inside the DispatcherServlet, only for mapped requests, with the chosen controller method in hand.
  - title: Proxies wrap beans
    text: Spring AOP puts a generated proxy in front of a bean, so advice runs around method calls from any caller, web or not.
  - title: Only calls through the proxy count
    text: A method calling another method on this skips the proxy and its advice.
quiz_hint: Ask where each mechanism sits, outside the DispatcherServlet, inside it, or around a bean.
quiz:
  - q: You need to add a response header to every request, including ones that end in a 404 or hit static files. Which do you use?
    options:
      - A HandlerInterceptor's postHandle
      - A servlet Filter, such as one extending OncePerRequestFilter
      - An @Around aspect on the controllers
    answer: 1
    explain: Filters wrap the whole servlet pipeline. Interceptors only run for requests that a handler mapping matched, and for @ResponseBody methods postHandle is already too late to change the response.
  - q: A @RestController method returns an object. Can an interceptor's postHandle add a header to that response?
    options:
      - Yes, postHandle runs before the body is written
      - No; the body has already been written and the response committed inside the HandlerAdapter
      - Only if the header name starts with X-
    answer: 1
    explain: For @ResponseBody and ResponseEntity, the converter writes the body inside the adapter, before postHandle. Use a filter, a ResponseBodyAdvice or set the header in the controller.
  - q: An @Around aspect is placed on InvoiceService.total(). Inside the same class, render() calls this.total(). Does the aspect run for that call?
    options:
      - Yes, every call to total() is advised
      - No; this refers to the target object, not the proxy, so the advice is skipped
      - Only if total() is public
    answer: 1
    explain: Spring AOP is proxy-based. Only calls that come in through the proxy, from another bean, are intercepted. Self-invocation goes straight to the target. AspectJ weaving is the alternative when this matters.
links:
  - title: Interception (HandlerInterceptor, Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/web/webmvc/mvc-servlet/handlermapping-interceptor.html
  - title: Proxying mechanisms (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/core/aop/proxying.html
  - title: Filters (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/web/webmvc/filters.html
---
Spring gives you three places to put cross-cutting code. A servlet **filter** wraps the whole request before Spring MVC has decided anything. A **`HandlerInterceptor`** runs inside the `DispatcherServlet` once a controller method has been chosen. An **AOP proxy** wraps a bean, so its advice runs around method calls no matter whether they came from a web request, a scheduled job or a message listener.

## Filters: the outermost layer

```java
@Component
class RequestIdFilter extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                  FilterChain chain) throws ServletException, IOException {
    String id = Optional.ofNullable(req.getHeader("X-Request-Id"))
        .orElse(UUID.randomUUID().toString());
    MDC.put("requestId", id);
    res.setHeader("X-Request-Id", id);
    try {
      chain.doFilter(req, res);          // everything else happens inside this call
    } finally {
      MDC.remove("requestId");
    }
  }
}
```

Spring Boot registers any `Filter` bean with the embedded server, mapped to `/*`. Use `FilterRegistrationBean` to limit the URL patterns or set the order. `OncePerRequestFilter` guarantees one run per request even when the request is forwarded or dispatched again for an error page. Spring Security itself is a filter.

## Interceptors: inside Spring MVC

```java
@Component
class TimingInterceptor implements HandlerInterceptor {
  public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
    req.setAttribute("start", System.nanoTime());
    return true;                         // false stops the request here
  }
  public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
                              Object handler, Exception ex) { /* record duration */ }
}

@Configuration
class WebConfig implements WebMvcConfigurer {
  private final TimingInterceptor timing;
  WebConfig(TimingInterceptor timing) { this.timing = timing; }
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(timing).addPathPatterns("/api/**");
  }
}
```

The `handler` argument is usually a `HandlerMethod`, so an interceptor can read annotations on the target controller method. `postHandle` is of limited use for REST controllers: the JSON has already been written.

## AOP proxies: around beans

```java
@Aspect
@Component
class SlowCallLogger {
  @Around("@annotation(com.example.Timed)")
  Object time(ProceedingJoinPoint pjp) throws Throwable {
    long t0 = System.nanoTime();
    try { return pjp.proceed(); }
    finally { log(pjp.getSignature(), System.nanoTime() - t0); }
  }
}
```

When a bean matches a pointcut, a post-processor replaces it with a proxy. Spring Boot creates class-based (CGLIB) proxies by default (`spring.aop.proxy-target-class=true`): a generated subclass whose methods run the advice and then call your real object. `@Transactional`, `@Cacheable`, `@Async` and method security all work this way.

The catch is that only calls through the proxy are intercepted. Inside the bean, `this.someMethod()` calls the real object directly, and the advice is silently skipped. Final methods can't be overridden by the subclass, so they can't be advised either.

## Choosing

| Need | Use |
| --- | --- |
| Every request, including errors and static files | Filter |
| Only controller requests, needs the handler | Interceptor |
| Behaviour around service methods, from any caller | Aspect or a Spring annotation |

```trace diagram
id: three-layers
title: Filter, interceptor, proxy
subtitle: Where each one wraps a call
groups:
  - { id: servlet, label: Servlet container }
  - { id: mvc, label: Spring MVC }
  - { id: aop, label: "InvoiceService bean, as others see it" }
  - { id: target, label: "The real InvoiceService" }
elements:
  - { id: client, label: HTTP request, sub: "GET /api/invoices/7", kind: person }
  - { id: filter, label: RequestIdFilter, sub: OncePerRequestFilter, group: servlet }
  - { id: dispatcher, label: DispatcherServlet, sub: picks the handler, group: mvc, kind: system }
  - { id: interceptor, label: TimingInterceptor, sub: "preHandle, afterCompletion", group: mvc }
  - { id: controller, label: InvoiceController, sub: "@RestController", group: mvc }
  - { id: job, label: Nightly job, sub: "@Scheduled, no request", kind: person }
  - { id: proxy, label: CGLIB proxy, sub: generated subclass, group: aop, tone: stream }
  - { id: aspect, label: SlowCallLogger, sub: "@Around advice", group: aop, tone: stream }
  - { id: total, label: "total()", group: target }
  - { id: render, label: "render()", group: target }
edges:
  - { id: http, from: client, to: filter }
  - { id: dofilter, from: filter, to: dispatcher, label: chain.doFilter }
  - { id: prehandle, from: dispatcher, to: interceptor, label: preHandle }
  - { id: invoke, from: dispatcher, to: controller, label: invoke handler }
  - { id: calltotal, from: controller, to: proxy, label: "total()" }
  - { id: scheduled, from: job, to: proxy, label: "total()" }
  - { id: advice, from: proxy, to: aspect }
  - { id: proceed, from: aspect, to: total, label: "proceed()" }
  - { id: callrender, from: proxy, to: render, label: "render(): not advised" }
  - { id: self, from: render, to: total, label: "this.total()", style: dashed }
steps:
  - caption: "A request reaches the servlet filters first, before Spring MVC has decided anything. A filter sees every request, including ones that end in a 404 or an error page."
    focus: [client, filter]
    trace: [http]
  - caption: "RequestIdFilter puts an id in the logging context and on the response, then calls chain.doFilter. Everything else in the request happens inside that one call, and its finally block clears the id on the way out."
    focus: [filter, dispatcher]
    trace: [dofilter]
  - caption: "Inside the DispatcherServlet a handler has been chosen. The interceptor's preHandle runs with that controller method in hand, so it can read its annotations. Returning false would stop the request here."
    focus: [dispatcher, interceptor]
    trace: [prehandle]
  - caption: "The controller method runs. Its InvoiceService field doesn't hold your object: it holds a proxy, a generated subclass that Spring put in the bean's place."
    focus: [dispatcher, controller, proxy]
    trace: [invoke]
  - caption: "The controller calls total() on the proxy. The method matches the aspect's pointcut, so the proxy runs the @Around advice, which starts a timer and calls proceed() into the real total()."
    focus: [controller, proxy, aspect, total]
    trace: [calltotal, advice, proceed]
  - caption: "A scheduled job calls the same bean with no request at all. No filter and no interceptor run, but the advice still does, because the job also calls through the proxy."
    focus: [job, proxy, aspect, total]
    trace: [scheduled, advice, proceed]
  - caption: "Now the controller calls render(), which is not advised, so the proxy passes it straight to the real object. Inside, render calls this.total(). That call never leaves the real object, so the advice is silently skipped."
    focus: [proxy, render, total]
    trace: [callrender, self]
  - caption: "On the way back out, the interceptor's afterCompletion runs once the response is done; postHandle would be too late to change a JSON body. Last of all the filter's finally block runs, so a filter wraps everything."
    focus: [filter, interceptor]
note: "Every request: a filter. Only controller requests, with the handler: an interceptor. Around bean methods from any caller: an aspect."
```
