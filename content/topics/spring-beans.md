---
id: spring-beans
title: Bean scopes and lifecycle
summary: One instance or many, and when each is born and dies
why: Most beans are shared by every request at once, so a single mutable field in a singleton is a data race waiting for traffic.
requires: [spring-ioc]
lesson: none
points:
  - title: Singleton is the default
    text: One instance per container, shared by every thread that serves a request. Keep it stateless.
  - title: Other scopes are opt-in
    text: Prototype gives a new instance per lookup; request and session scopes give one per HTTP request or session.
  - title: Creation has steps
    text: Construct, inject, run post-processors and @PostConstruct, then the bean is ready. On shutdown, @PreDestroy runs.
  - title: Post-processors make proxies
    text: The step after initialisation is where Spring may swap your object for a proxy that adds behaviour around it.
quiz_hint: Remember how many instances of a singleton exist, and how many threads can call it at once.
quiz:
  - q: A singleton @Service keeps the current user's id in an instance field set at the start of each request. What goes wrong under load?
    options:
      - Nothing; each request gets its own service
      - Concurrent requests overwrite each other's value, so one user can see another's data
      - Spring throws an exception when the field is written
    answer: 1
    explain: There is one instance, called by many request threads at the same time. Per-request data belongs in method parameters, a request-scoped bean, or the security context, never in a singleton's field.
  - q: A singleton is injected with a prototype-scoped bean in its constructor. How many prototype instances does it use over its life?
    options:
      - A new one for every method call
      - One, created when the singleton was created
      - None until the first request
    answer: 1
    explain: Injection happens once. To get a fresh prototype each time, inject an ObjectProvider<T> and call getObject(), or use a scoped proxy.
  - q: In what order run a constructor, @PostConstruct and field injection for one bean?
    options:
      - "@PostConstruct, constructor, injection"
      - Constructor, injection, @PostConstruct
      - Injection, constructor, @PostConstruct
    answer: 1
    explain: The object has to exist before fields or setters can be set, and @PostConstruct runs only once every dependency is in place. That is why start-up checks belong in @PostConstruct, not in a field initialiser.
links:
  - title: Bean scopes (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/core/beans/factory-scopes.html
  - title: Customizing the nature of a bean (lifecycle callbacks, Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/core/beans/factory-nature.html
  - title: Container overview (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/core/beans/basics.html
---
A bean's scope says how many instances the container makes and how long each lives. The default, singleton, means exactly one instance per application context, created at start-up and shared by every caller. In a web application that means every request thread runs through the same object at the same time, so the rule of thumb is simple: singletons hold collaborators and configuration, never per-request state.

## The scopes you will meet

| Scope | Instances | Typical use |
| --- | --- | --- |
| `singleton` (default) | One per container | Services, repositories, clients |
| `prototype` | A new one each time it is requested from the container | Stateful helpers, builders |
| `request` | One per HTTP request | Per-request context |
| `session` | One per HTTP session | Shopping basket in a server-rendered app |
| `application` | One per `ServletContext` | Rarely needed |

```java
@Component
@Scope("prototype")
class ReportBuilder { private final List<String> lines = new ArrayList<>(); }

@Service
class ReportService {
  private final ObjectProvider<ReportBuilder> builders;

  ReportService(ObjectProvider<ReportBuilder> builders) { this.builders = builders; }

  String build() {
    ReportBuilder b = builders.getObject();   // fresh instance each call
    ...
  }
}
```

Injecting the prototype directly into the constructor would give the singleton one builder for life, which is a classic surprise. `ObjectProvider` (or a scoped proxy, which is how `request` and `session` beans can be injected into singletons) defers the lookup to the moment you need it.

## From constructor to destruction

For each singleton, the container goes through the same steps:

1. Call the constructor (with constructor-injected dependencies).
2. Inject fields and setters, if any.
3. Run `BeanPostProcessor`s before initialisation, then the init callbacks: `@PostConstruct` first, then `InitializingBean.afterPropertiesSet()`, then a custom init method.
4. Run `BeanPostProcessor`s after initialisation. This is where Spring may return a **proxy** instead of your object, for `@Transactional`, `@Async`, `@Cacheable` and similar.
5. The bean is ready. On a clean shutdown, `@PreDestroy` (and other destroy callbacks) run in reverse order.

```java
@Component
class PriceCache {
  @PostConstruct
  void warm() { /* every dependency is set by now */ }

  @PreDestroy
  void flush() { /* runs on graceful shutdown */ }
}
```

In Boot 3 these annotations come from `jakarta.annotation`, not `javax.annotation`. One detail: Spring does not track prototype beans after handing them out, so their destroy callbacks are not called; cleaning them up is your job.

## Why step 4 matters

The object other beans receive may not be the class you wrote, but a generated subclass that wraps it. Most of the surprises in the transactions topic, such as an annotation that "does nothing", come from forgetting that the proxy exists and when it is bypassed.
