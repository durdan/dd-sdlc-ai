---
id: spring-ioc
title: The IoC container and dependency injection
summary: Who builds your objects, and hands them their parts
why: Every Spring feature, from transactions to security, works because the container, not your code, creates the objects and decides what they are wired to.
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: You describe, the container builds
    text: Classes say what they need; the ApplicationContext reads the definitions, creates the objects and passes the dependencies in.
  - title: Constructor injection first
    text: Final fields set in the constructor make dependencies explicit, impossible to forget and easy to replace in a test.
  - title: Wiring is by type
    text: Spring matches a constructor parameter to a bean of that type. Zero candidates or several candidates are both start-up errors.
  - title: Failures happen at start-up
    text: A missing or ambiguous dependency stops the application before it takes a single request, which is exactly when you want to find out.
quiz_hint: Think about what the container knows when it reads a constructor, and what it does when it finds zero or two matches.
quiz:
  - q: A class has one constructor and no annotations on it. How does Spring know to inject its parameters?
    options:
      - It doesn't; you must add @Autowired
      - With a single constructor, Spring uses it automatically
      - Spring only injects fields, never constructors
    answer: 1
    explain: If a bean has exactly one constructor, Spring uses it and resolves each parameter from the container. @Autowired is only needed to choose between several constructors.
  - q: Two beans implement PaymentGateway and a service asks for a PaymentGateway in its constructor. What happens?
    options:
      - Spring picks the first one it found
      - Start-up fails with a NoUniqueBeanDefinitionException unless one is marked @Primary or the parameter has a @Qualifier
      - Spring injects a list of both
    answer: 1
    explain: Injection is by type, and two candidates are ambiguous. @Primary marks a default, @Qualifier names the one you want, and asking for List<PaymentGateway> would give you all of them.
  - q: A and B each take the other in their constructor. What does Spring Boot 3 do by default?
    options:
      - Creates a proxy to break the cycle
      - Fails at start-up because circular references are not allowed
      - Injects null into one of them
    answer: 1
    explain: Since Boot 2.6, spring.main.allow-circular-references defaults to false, and constructor cycles could never be resolved anyway. The fix is almost always a better split of responsibilities.
links:
  - title: Introduction to the IoC container (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/core/beans/introduction.html
  - title: Dependency injection (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/core/beans/dependencies/factory-collaborators.html
  - title: Spring Beans and Dependency Injection (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/using/spring-beans-and-dependency-injection.html
  - title: Container extension points, BeanPostProcessor (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/core/beans/factory-extension.html
---
In a Spring application you rarely write `new OrderService(...)`. Instead, an `ApplicationContext` (the IoC container, for "inversion of control") reads which classes are components, works out what each one needs, creates them in the right order and passes the dependencies in. Your code describes the parts; the container assembles the machine. That one shift is what lets Spring later wrap your objects in proxies for transactions, security and metrics without you changing a line.

## Describing beans

There are two common ways to tell the container about an object. Component scanning finds classes annotated with `@Component` (or its specialisations `@Service`, `@Repository`, `@Controller`) under the package of your `@SpringBootApplication` class. A `@Bean` method in a `@Configuration` class is for objects you can't annotate, such as a client from a library.

```java
@Service
public class OrderService {
  private final OrderRepository orders;
  private final Clock clock;

  // One constructor: no @Autowired needed
  public OrderService(OrderRepository orders, Clock clock) {
    this.orders = orders;
    this.clock = clock;
  }
}

@Configuration
class TimeConfig {
  @Bean
  Clock clock() {
    return Clock.systemUTC();
  }
}
```

When the context starts it sees that `OrderService` needs an `OrderRepository` and a `Clock`, finds (or first creates) a bean of each type, and calls the constructor. Each object made this way is a bean.

## Why constructor injection

Spring can also inject into fields (`@Autowired private Foo foo`) or setters, but the constructor is the better default:

- The fields can be `final`, so the object is complete the moment it exists.
- A unit test can call the constructor with fakes; no container needed.
- A constructor with eight parameters is a visible sign the class does too much. Eight injected fields hide it.

## When there are several candidates

Matching is by type. If two beans implement the same interface, the container refuses to guess:

```java
@Bean @Primary
PaymentGateway stripe() { return new StripeGateway(); }

@Bean
PaymentGateway paypal() { return new PayPalGateway(); }

// Gets stripe (the primary) unless it asks by name
public CheckoutService(@Qualifier("paypal") PaymentGateway gateway) { ... }
```

You can also ask for `List<PaymentGateway>` or `Map<String, PaymentGateway>` to receive all of them, which is a neat way to build plug-in style strategies.

## Fail fast

Because the whole graph is built at start-up, a missing bean, an ambiguous type or a cycle stops the application with a message naming the class and the parameter. That is a feature: a broken wiring diagram never reaches production traffic. Since Spring Boot 2.6 circular references are rejected by default too; if two services need each other, a third class usually wants to exist.

```trace diagram
id: context-startup
title: The container starts up
subtitle: From annotated classes to wired beans
groups:
  - { id: describe, label: What your code describes }
  - { id: container, label: ApplicationContext }
  - { id: beans, label: Beans }
elements:
  - { id: app, label: "SpringApplication.run", sub: "@SpringBootApplication class", kind: person }
  - { id: scan, label: Component scan, sub: "@Service, @Repository, ...", group: describe }
  - { id: config, label: TimeConfig, sub: "@Configuration, @Bean clock()", group: describe }
  - { id: defs, label: Bean definitions, sub: "recipes: type, scope, dependencies", group: container, kind: store, tone: data }
  - { id: factory, label: Bean factory, sub: creates beans in dependency order, group: container, kind: system }
  - { id: bpp, label: BeanPostProcessors, sub: "@Transactional, AOP, ..." }
  - { id: fail, label: Start-up fails, sub: "missing, ambiguous or circular", kind: external }
  - { id: clock, label: Clock, sub: "from clock()", group: beans }
  - { id: repo, label: OrderRepository, group: beans }
  - { id: service, label: OrderService, sub: "new OrderService(repo, clock)", group: beans }
  - { id: proxy, label: OrderService proxy, sub: the bean others are given, tone: stream }
edges:
  - { id: run, from: app, to: scan }
  - { id: found, from: scan, to: defs, label: register }
  - { id: bean, from: config, to: defs }
  - { id: read, from: defs, to: factory }
  - { id: mkclock, from: factory, to: clock }
  - { id: mkrepo, from: factory, to: repo }
  - { id: injclock, from: clock, to: service, style: dotted }
  - { id: injrepo, from: repo, to: service, style: dotted }
  - { id: wrap, from: service, to: bpp }
  - { id: proxied, from: bpp, to: proxy, label: wrap }
  - { id: broken, from: factory, to: fail, label: 0 or 2 candidates, style: dashed }
steps:
  - caption: "Your main method calls SpringApplication.run, which creates the ApplicationContext. Nothing in your code says new OrderService anywhere."
    focus: [app, container]
  - caption: "Component scanning looks under the package of your @SpringBootApplication class and finds classes marked @Service, @Repository and so on. Each becomes a bean definition: a recipe, not yet an object."
    focus: [app, scan, defs]
    trace: [run, found]
  - caption: "A @Configuration class is found the same way, and each of its @Bean methods, such as clock(), becomes a definition too. That is how objects you can't annotate get into the container."
    focus: [config, defs]
    trace: [bean]
  - caption: "The bean factory reads the definitions and works out the graph. OrderService's one constructor needs an OrderRepository and a Clock, so those are created first."
    focus: [defs, factory, clock, repo]
    trace: [read, mkclock, mkrepo]
  - caption: "Then it calls the constructor with them. Matching is by type, so each parameter gets the one bean of that type, and the final fields are set before anyone else can see the object."
    focus: [clock, repo, service]
    trace: [injclock, injrepo]
  - caption: "If a parameter has no candidate, or two with no @Primary or @Qualifier to choose, or two constructors need each other, the application stops here with a message naming the class and the parameter."
    focus: [factory, fail]
    trace: [broken]
  - caption: "After construction and init callbacks such as @PostConstruct, every bean passes the BeanPostProcessors. Spring's AOP auto-proxying is one of them: it sees @Transactional on OrderService and returns a proxy in its place."
    focus: [service, bpp, proxy]
    trace: [wrap, proxied]
  - caption: "From now on the proxy is the bean. Other beans that ask for an OrderService are handed the proxy, which is how transactions and security run without you changing a line."
    focus: [proxy]
  - caption: "Once every singleton is built and wired, the context is ready and the application starts taking requests. A broken wiring diagram never reached this point."
    focus: [beans]
note: "Want every implementation? Ask for List<PaymentGateway> and the container injects all the matching beans."
```
