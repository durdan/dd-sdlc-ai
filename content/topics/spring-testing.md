---
id: spring-testing
title: Testing with slices, @SpringBootTest and Testcontainers
summary: Start as little of the application as the test needs
why: A suite that boots the whole application for every check gets slow enough that people stop running it; one that never touches a real database misses the bugs that matter.
requires: [spring-request, spring-jpa]
lesson: diagram
points:
  - title: Plain tests first
    text: Constructor injection means most logic can be tested with new and a few fakes, with no Spring at all.
  - title: Slices load one layer
    text: "@WebMvcTest starts only the MVC layer; @DataJpaTest starts only JPA and repositories."
  - title: "@SpringBootTest loads everything"
    text: The full context, optionally with a real server on a random port, for end-to-end checks of the wiring.
  - title: Real dependencies in containers
    text: Testcontainers with @ServiceConnection runs a real PostgreSQL or Kafka in Docker and points Boot at it.
quiz_hint: Match each test to the smallest context that can still catch the bug it is looking for.
quiz:
  - q: You want to check that POST /orders returns 400 for an invalid body. Which test is the best fit?
    options:
      - "@SpringBootTest with a real server and a database"
      - "@WebMvcTest(OrderController.class) with MockMvc and the service replaced by a mock"
      - A plain JUnit test that calls the controller method directly
    answer: 1
    explain: Validation, argument binding and the status code are MVC concerns, so a web slice tests them in a fraction of a second. Calling the method directly would skip binding and validation entirely.
  - q: By default, what happens to rows a @DataJpaTest test inserts?
    options:
      - They stay in the database for the next test
      - Each test runs in a transaction that is rolled back at the end
      - The schema is dropped after every test
    answer: 1
    explain: Data JPA tests are transactional and roll back by default, which keeps tests independent. It also means nothing is committed, so behaviour that happens only at commit, such as some constraint checks or after-commit listeners, needs a different test.
  - q: What does @ServiceConnection on a @Container PostgreSQLContainer field do?
    options:
      - Starts PostgreSQL inside the JVM
      - Tells Boot to configure the DataSource from the running container's host, port and credentials, with no properties to write
      - Replaces PostgreSQL with H2
    answer: 1
    explain: Since Boot 3.1, a service connection reads the connection details from the container. Without it you would wire spring.datasource.* yourself with @DynamicPropertySource.
links:
  - title: Testing Spring Boot applications (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/testing/spring-boot-applications.html
  - title: Testcontainers (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/testing/testcontainers.html
  - title: Testing the web layer (spring.io guide)
    url: https://spring.io/guides/gs/testing-web
---
Spring Boot's test support is about choosing how much of the application to start. A plain unit test starts nothing. A **slice** such as `@WebMvcTest` or `@DataJpaTest` starts one layer with only the auto-configuration it needs. `@SpringBootTest` starts the whole context, and can start the embedded server too. Testcontainers adds real infrastructure, such as PostgreSQL in Docker, so the tests that matter run against the same database as production.

## The web slice

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {
  @Autowired MockMvc mvc;
  @MockitoBean OrderService orders;     // replaces the real bean in this context

  @Test
  void rejectsEmptyOrder() throws Exception {
    mvc.perform(post("/orders/7")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"items\":[]}"))
        .andExpect(status().isBadRequest());
  }
}
```

`@WebMvcTest` limits scanning to web components (controllers, `@ControllerAdvice`, filters, converters, interceptors, `WebMvcConfigurer`s) and skips `@Service`, `@Repository` and ordinary `@Configuration` classes; collaborators are mocks. Spring Security's auto-configuration still applies, so `@Import` your own security configuration if the test should use its rules. `MockMvc` sends requests through the real `DispatcherServlet` without opening a socket. `@MockitoBean` comes from Spring Framework 6.2; the older `@MockBean` from Boot is deprecated since Boot 3.4.

## The JPA slice

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class OrderRepositoryTest {
  @Container @ServiceConnection
  static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");

  @Autowired OrderRepository repo;

  @Test
  void findsRecentOrdersWithItems() { ... }
}
```

`@DataJpaTest` configures entities, repositories and a `TestEntityManager`; each test runs in a transaction that is rolled back. On its own it swaps in an embedded database if one is on the classpath. `Replace.NONE` keeps the real one, here a container that `@ServiceConnection` wires in automatically. Testing against the same database engine as production catches dialect differences, real constraint behaviour and the N+1 query counts an in-memory database would hide.

## The whole application

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class CheckoutFlowTest {
  @Container @ServiceConnection
  static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");

  @Autowired TestRestTemplate http;

  @Test
  void placesAnOrder() {
    var res = http.postForEntity("/orders/7", newOrder(), OrderView.class);
    assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
  }
}
```

Without `webEnvironment`, `@SpringBootTest` uses a mock web environment and starts no server. `RANDOM_PORT` starts the real embedded server, so filters, security, serialisation and transactions behave exactly as in production. One trap here: the test and the server run on different threads, so a `@Transactional` on the test method does not roll back what the server committed.

## Keep the suite fast

Spring caches application contexts between test classes that use the same configuration. Every distinct combination of `@MockitoBean`s, properties or profiles creates a new context, so a suite with twenty slightly different set-ups starts twenty applications. Share a few base configurations, keep most tests as plain unit tests, and save `@SpringBootTest` for the flows that need everything.

```trace diagram
id: what-each-test-starts
title: What each test starts
subtitle: A web slice, a JPA slice and the whole application
direction: DOWN
groups:
  - { id: tests, label: Test classes }
  - { id: context, label: Application context }
  - { id: docker, label: "Docker, via Testcontainers" }
elements:
  - { id: webtest, label: OrderControllerTest, sub: "@WebMvcTest", kind: component, group: tests, row: 0, role: client }
  - { id: e2etest, label: CheckoutFlowTest, sub: "@SpringBootTest, RANDOM_PORT", kind: component, group: tests, row: 0, role: client }
  - { id: repotest, label: OrderRepositoryTest, sub: "@DataJpaTest", kind: component, group: tests, row: 0, role: client }
  - { id: mockmvc, label: MockMvc, sub: no socket, group: context, row: 1 }
  - { id: tomcat, label: Embedded Tomcat, sub: a random port, group: context, row: 1 }
  - { id: web, label: Web layer, sub: "controllers, advice, filters, converters", group: context, row: 2 }
  - { id: mock, label: OrderService mock, sub: "@MockitoBean", tone: neutral, group: context, row: 3 }
  - { id: service, label: Services, sub: "@Service beans", group: context, row: 3 }
  - { id: repos, label: Repositories, sub: "JPA, TestEntityManager", group: context, row: 4 }
  - { id: pg, label: PostgreSQL, sub: "postgres:16, @ServiceConnection", kind: store, group: docker, row: 5 }
edges:
  - { id: perform, from: webtest, to: mockmvc }
  - { id: dispatch, from: mockmvc, to: web }
  - { id: mocked, from: web, to: mock }
  - { id: query, from: repotest, to: repos }
  - { id: sql, from: repos, to: pg }
  - { id: http, from: e2etest, to: tomcat }
  - { id: serve, from: tomcat, to: web }
  - { id: call, from: web, to: service }
  - { id: save, from: service, to: repos }
steps:
  - caption: Three test classes, three different amounts of application. Before any of them, most logic needs no Spring at all; with constructor injection, a plain unit test calls new with a few fakes.
    focus: [webtest, repotest, e2etest]
  - caption: "@WebMvcTest starts only the web layer: controllers, @ControllerAdvice, filters, converters and the MVC configuration. MockMvc sends the request through the real DispatcherServlet without opening a socket."
    focus: [webtest, mockmvc, web]
    trace: [perform, dispatch]
  - caption: Services and repositories are not scanned, so the controller's OrderService is a @MockitoBean. The test checks binding, validation and the 400 status in a fraction of a second.
    focus: [web, mock]
    trace: [mocked]
  - caption: "@DataJpaTest starts the JPA side instead: entities, repositories and a TestEntityManager. No controllers, no services."
    focus: [repotest, repos]
    trace: [query]
  - caption: Testcontainers starts a real PostgreSQL in Docker. @ServiceConnection hands its host, port and credentials to Boot, and Replace.NONE stops the slice swapping in an embedded database.
    focus: [repos, pg]
    trace: [sql]
  - caption: Each @DataJpaTest test runs in a transaction that is rolled back at the end, so tests stay independent. Nothing is committed, so commit-time behaviour needs another kind of test.
    focus: [repotest, repos, pg]
  - caption: "@SpringBootTest with RANDOM_PORT starts the whole context and the real embedded server. The test sends real HTTP, through filters, security and serialisation, exactly as in production."
    focus: [e2etest, tomcat, web]
    trace: [http, serve]
  - caption: This time the real service and repository run, against the same container. The server handles the request on its own thread, so a @Transactional test method cannot roll back what it committed.
    focus: [web, service, repos, pg]
    trace: [call, save, sql]
  - caption: Spring caches each context and reuses it for every test class with the same configuration. Each different set of mocks, properties or profiles starts another one, so share a few set-ups.
    focus: [webtest, repotest, e2etest]
```
