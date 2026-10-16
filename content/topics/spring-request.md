---
id: spring-request
title: From socket to controller and back
summary: Tomcat, the DispatcherServlet and the message converters
why: When a request is slow, rejected with 415 or answered with the wrong JSON, knowing each hop tells you where to look.
requires: [spring-autoconfig]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Tomcat owns the thread
    text: The embedded server accepts the connection and runs the whole request on one worker thread from its pool (200 by default).
  - title: One servlet in front
    text: Every request passes the filters and then the DispatcherServlet, which finds the handler for the path and method.
  - title: Arguments are resolved
    text: Resolvers turn path variables, query parameters, headers and the body into your method's parameters.
  - title: Converters do the JSON
    text: HttpMessageConverters read the request body and write the return value, chosen by Content-Type and Accept.
quiz_hint: Follow the request in order, from the socket to the method call, then back out through the converters.
quiz:
  - q: A client POSTs JSON without a Content-Type header to an @RequestBody endpoint. What is the likely response?
    options:
      - 200, Spring guesses JSON
      - 415 Unsupported Media Type, because no message converter claims the body
      - 404 Not Found
    answer: 1
    explain: The converter is chosen by the request's Content-Type. With none that a converter supports, Spring answers 415 before your method is ever called.
  - q: All 200 Tomcat worker threads are blocked waiting on a slow downstream service. What happens to new requests?
    options:
      - They run on new threads that Tomcat creates on demand
      - They wait in the accept queue (100 by default) and are then refused or time out
      - Spring MVC queues them in memory without limit
    answer: 1
    explain: The pool is bounded by server.tomcat.threads.max. Further connections wait in the operating system's accept queue, sized by server.tomcat.accept-count, and beyond that are refused. Timeouts on downstream calls are what free the threads.
  - q: Which component maps GET /orders/42 to OrderController.get(Long id)?
    options:
      - The HttpMessageConverter
      - RequestMappingHandlerMapping, which the DispatcherServlet asks for a handler
      - Tomcat's own URL mapper
    answer: 1
    explain: Tomcat only knows that everything goes to the DispatcherServlet. Inside it, RequestMappingHandlerMapping holds the @RequestMapping routes and returns the matching handler method.
links:
  - title: DispatcherServlet (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/web/webmvc/mvc-servlet.html
  - title: Special bean types in the DispatcherServlet (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/web/webmvc/mvc-servlet/special-bean-types.html
  - title: Handler method arguments (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/web/webmvc/mvc-controller/ann-methods/arguments.html
  - title: Servlet web applications (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/web/servlet.html
---
A Spring Boot web application is a plain Java program that starts an embedded server, by default Tomcat on port 8080. Tomcat accepts the TCP connection, parses the HTTP request and hands it to a worker thread, which carries it through the servlet filters and into Spring MVC's `DispatcherServlet`. From there Spring finds the right controller method, builds its arguments, calls it and turns the return value back into bytes, all on that same thread.

## The journey of one request

```java
@RestController
@RequestMapping("/orders")
class OrderController {
  private final OrderService orders;
  OrderController(OrderService orders) { this.orders = orders; }

  @PostMapping("/{customerId}")
  ResponseEntity<OrderView> create(@PathVariable long customerId,
                                   @RequestBody @Valid NewOrder body) {
    OrderView created = orders.create(customerId, body);
    return ResponseEntity.status(201).body(created);
  }
}
```

For `POST /orders/7` with a JSON body, roughly this happens:

1. **Tomcat** takes a thread from its pool (`server.tomcat.threads.max`, 200 by default) and builds an `HttpServletRequest`.
2. **Filters** run in order: character encoding, Spring Security, any `Filter` beans of your own.
3. The **`DispatcherServlet`** asks each `HandlerMapping` for a handler. `RequestMappingHandlerMapping` matches the path pattern and the HTTP method to `create`.
4. **Interceptors** registered for that path get `preHandle`.
5. A **`HandlerAdapter`** invokes the method. First, `HandlerMethodArgumentResolver`s build each argument: `@PathVariable` from the URI template, `@RequestParam` from the query string, `@RequestBody` by asking the **`HttpMessageConverter`** that supports the request's `Content-Type` (Jackson, for `application/json`) to read the body. `@Valid` then runs Bean Validation.
6. Your method runs.
7. The return value is written by a converter that matches the client's `Accept` header. For `@ResponseBody` and `ResponseEntity` this happens inside the adapter, before `postHandle`.
8. If anything threw, `HandlerExceptionResolver`s (including your `@ControllerAdvice` with `@ExceptionHandler` methods) turn the exception into a response.

## Status codes that tell you which step failed

| You see | The request stopped at |
| --- | --- |
| 404 | No handler mapping matched the path |
| 405 | The path matched, the HTTP method did not |
| 415 | No converter can read the request's `Content-Type` |
| 406 | No converter can write what `Accept` asks for |
| 400 | An argument could not be bound or failed `@Valid` |

## Threads are the budget

One request holds one Tomcat thread from start to finish, including every database call and HTTP call it makes. When the pool is exhausted, new connections queue in the accept backlog (`server.tomcat.accept-count`, 100 by default) and are then refused. Slow downstream calls without timeouts are the usual cause. On Java 21, `spring.threads.virtual.enabled=true` (Boot 3.2+) runs requests on virtual threads instead, so blocking no longer pins a scarce platform thread; but the database still has only as many connections as the pool allows.

```trace diagram
id: request-journey
title: A request's journey
subtitle: POST /orders/7, from the socket to the database and back
direction: DOWN
groups:
  - { id: servlet, label: Servlet container }
  - { id: mvc, label: Spring MVC }
  - { id: app, label: Your code }
elements:
  - { id: client, label: Client, sub: "POST /orders/7, JSON body", kind: person }
  - { id: tomcat, label: Tomcat connector, sub: worker threads (max 200), group: servlet }
  - { id: filters, label: Filter chain, sub: your Filter beans, group: servlet }
  - { id: security, label: FilterChainProxy, sub: Spring Security, group: servlet, role: security }
  - { id: dispatcher, label: DispatcherServlet, sub: the front controller, group: mvc, kind: system }
  - { id: mapping, label: HandlerMapping, sub: path + method → handler, group: mvc }
  - { id: interceptors, label: Interceptors, sub: "preHandle, postHandle", group: mvc }
  - { id: adapter, label: HandlerAdapter, sub: argument resolvers, group: mvc }
  - { id: converters, label: HttpMessageConverters, sub: "Jackson: JSON ⇄ objects", group: mvc, tone: stream, role: service }
  - { id: controller, label: OrderController, sub: "@RestController", group: app }
  - { id: service, label: OrderService, sub: "@Transactional proxy", group: app, role: service }
  - { id: repository, label: OrderRepository, sub: Spring Data JPA, group: app }
  - { id: hikari, label: HikariCP, sub: pool of 10 connections, tone: data }
  - { id: db, label: PostgreSQL, kind: store }
  - { id: response, label: Response, sub: "201 Created, JSON body", kind: person }
edges:
  - { id: http, from: client, to: tomcat, label: HTTP request }
  - { id: run, from: tomcat, to: filters, label: on one worker thread }
  - { id: secure, from: filters, to: security, label: doFilter, flow: security }
  - { id: dispatch, from: filters, to: dispatcher, label: service() }
  - { id: lookup, from: dispatcher, to: mapping, label: getHandler }
  - { id: prehandle, from: dispatcher, to: interceptors, label: preHandle }
  - { id: handle, from: dispatcher, to: adapter, label: handle }
  - { id: read, from: adapter, to: converters, label: read body }
  - { id: invoke, from: adapter, to: controller, label: "create(7, body)" }
  - { id: call, from: controller, to: service, label: create }
  - { id: borrow, from: service, to: hikari, label: getConnection }
  - { id: save, from: service, to: repository, label: save }
  - { id: sql, from: repository, to: db, label: INSERT, flow: data }
  - { id: pooled, from: hikari, to: db, label: pooled connection, style: dotted, flow: data }
  - { id: write, from: adapter, to: converters, label: write OrderView, style: dashed }
  - { id: respond, from: converters, to: response, label: back out through Tomcat, style: dashed }
steps:
  - caption: A client sends POST /orders/7 with a JSON body. On its way it crosses three layers. The embedded Tomcat server and its filters, then Spring MVC, which calls your code, which calls the database.
    focus: [client, tomcat]
    trace: [http]
  - caption: "Tomcat's connector accepts the connection, parses the HTTP request and hands it to a worker thread from its pool, 200 threads by default. That one thread carries the request the whole way."
    focus: [tomcat, filters]
    trace: [run]
  - caption: The thread runs the servlet filter chain in order. Spring Security is one filter in that chain, FilterChainProxy, which runs its own security filters and can answer 401 or 403 before Spring MVC sees anything.
    focus: [filters, security]
    trace: [secure]
  - caption: At the end of the chain is the DispatcherServlet, the one servlet in front of every controller. It asks its HandlerMappings for a handler, and RequestMappingHandlerMapping matches POST /orders/{customerId} to OrderController.create. No match is a 404.
    focus: [filters, dispatcher, mapping]
    trace: [dispatch, lookup]
  - caption: Interceptors registered for that path run preHandle first. If one returns false, the rest of the chain is skipped and the controller is never called.
    focus: [dispatcher, interceptors]
    trace: [prehandle]
  - caption: "A HandlerAdapter prepares the call. Argument resolvers build each parameter: the path variable from the URL, the body through the message converter that supports the request's Content-Type. Jackson reads the JSON and @Valid checks it. An unsupported Content-Type is a 415, invalid input a 400."
    focus: [dispatcher, adapter, converters]
    trace: [handle, read]
  - caption: Only now does your controller method run, still on the same Tomcat thread.
    focus: [adapter, controller]
    trace: [invoke]
  - caption: The call to OrderService goes through a proxy. Because the method is @Transactional, the proxy begins a transaction first, and that borrows a JDBC connection from the HikariCP pool, ten connections by default.
    focus: [controller, service, hikari]
    trace: [call, borrow]
  - caption: "The repository's save runs its SQL on that same connection. When the service method returns, the proxy commits and the connection goes back to the pool."
    focus: [service, repository, hikari, db]
    trace: [save, sql, pooled]
  - caption: "The controller returns a ResponseEntity. The adapter picks the converter that matches the client's Accept header, and Jackson writes OrderView as JSON. Nothing acceptable is a 406. For a response body this happens inside the adapter, before any postHandle."
    focus: [adapter, converters]
    trace: [write]
  - caption: The bytes go back out through Tomcat, the client gets 201 Created, and the worker thread returns to the pool for the next request.
    focus: [converters, response, tomcat]
    trace: [respond]
note: "If anything throws along the way, HandlerExceptionResolvers, including your @ControllerAdvice, turn the exception into a response."
```
