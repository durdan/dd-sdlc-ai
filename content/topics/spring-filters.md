---
id: spring-filters
title: Filters, interceptors and AOP proxies
summary: Three ways to run code around your code
why: Logging, auth, tenancy and timing all need to wrap requests or method calls; choosing the wrong layer means it runs too late, too often or not at all.
requires: [spring-request, spring-beans]
lesson: none
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
