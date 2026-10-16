---
id: spring-security
title: The Spring Security filter chain
summary: A row of filters that decides who you are and what you may do
why: Security problems in Spring apps are usually ordering problems; once you can read the filter list, a 401 or a missing CSRF check stops being a mystery.
requires: [spring-filters]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: One filter, many inside
    text: DelegatingFilterProxy hands requests to FilterChainProxy, which runs the filters of the first SecurityFilterChain that matches.
  - title: Authenticate, then authorise
    text: Authentication filters establish who the caller is; AuthorizationFilter, near the end, decides whether they may proceed.
  - title: The context is per request
    text: The result lands in the SecurityContextHolder, which code later in the request can read.
  - title: Configure with beans
    text: In Spring Security 6 you declare SecurityFilterChain beans with the lambda DSL; WebSecurityConfigurerAdapter is gone.
quiz_hint: Remember that FilterChainProxy picks exactly one chain, and that each filter runs in a fixed order.
quiz:
  - q: An app defines two SecurityFilterChain beans, one for /api/** and one for any request. A request for /api/orders arrives. Which chains run?
    options:
      - Both, in order
      - Only the first chain whose matcher matches, so ordering the more specific chain first matters
      - Whichever was declared last
    answer: 1
    explain: FilterChainProxy invokes only the first matching chain. Give the /api/** chain a higher priority with @Order, otherwise the catch-all chain swallows every request.
  - q: An unauthenticated request reaches a protected URL. Which filter turns the AccessDeniedException into a 401 or a redirect to the login page?
    options:
      - CsrfFilter
      - ExceptionTranslationFilter, which starts authentication through the configured AuthenticationEntryPoint
      - The DispatcherServlet
    answer: 1
    explain: AuthorizationFilter throws when access is denied, and ExceptionTranslationFilter, which sits just before it, catches the exception. For an anonymous caller it calls the entry point (401 or a login redirect); for an authenticated one it calls the AccessDeniedHandler (403).
  - q: You add spring-boot-starter-security and nothing else. What happens?
    options:
      - Nothing until you write a configuration class
      - Every endpoint requires authentication, with one generated user whose password is printed at start-up
      - Only /actuator endpoints are protected
    answer: 1
    explain: Boot's auto-configuration secures everything with form login and HTTP Basic and creates a single in-memory user named user with a random password. Declaring your own SecurityFilterChain replaces that default.
links:
  - title: Servlet security architecture (Spring Security 6.5)
    url: https://docs.spring.io/spring-security/reference/6.5/servlet/architecture.html
  - title: Spring Security in Spring Boot (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/web/spring-security.html
  - title: Securing a web application (spring.io guide)
    url: https://spring.io/guides/gs/securing-web
---
Spring Security plugs into your application as a single servlet filter, but that filter contains a whole chain of its own. The container calls a `DelegatingFilterProxy`, which forwards to the `FilterChainProxy` bean; that picks the first `SecurityFilterChain` whose request matcher fits the URL and runs its filters in a fixed order: headers, CSRF, logout, the authentication filters, exception translation and finally authorisation. Only after the last one says yes does the request reach the `DispatcherServlet`.

## A typical API configuration

```java
@Configuration
@EnableMethodSecurity
class SecurityConfig {

  @Bean
  @Order(1)
  SecurityFilterChain api(HttpSecurity http) throws Exception {
    return http
        .securityMatcher("/api/**")
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .csrf(csrf -> csrf.disable())   // stateless API using bearer tokens, not cookies
        .build();
  }

  @Bean
  @Order(2)
  SecurityFilterChain web(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults())
        .build();
  }
}
```

Two chains, two policies: the API validates JWT bearer tokens without sessions, the rest of the site uses a login form with sessions and CSRF protection on. Disable CSRF only where the browser does not send credentials automatically; cookie-based sessions need it.

## What the filters do

- **`SecurityContextHolderFilter`** loads any existing security context (for example from the session) for this request.
- **Authentication filters** (`BearerTokenAuthenticationFilter`, `UsernamePasswordAuthenticationFilter`, `BasicAuthenticationFilter`) turn credentials into an `Authentication` via the `AuthenticationManager` and store it in the `SecurityContextHolder`.
- **`AnonymousAuthenticationFilter`** sets an anonymous identity if nothing else did.
- **`ExceptionTranslationFilter`** catches security exceptions thrown further down and turns them into a 401 (start authentication) or a 403 (access denied).
- **`AuthorizationFilter`** checks the `authorizeHttpRequests` rules, first match wins.

Start-up logs the exact list for each chain at DEBUG level for `org.springframework.security`, which is the quickest way to see what is really configured.

## After the filters

`@EnableMethodSecurity` adds a second line of defence on beans, using the same proxies as `@Transactional`:

```java
@PreAuthorize("hasRole('ADMIN') or #customerId == authentication.name")
public Invoice invoice(String customerId) { ... }
```

And because the context is held per request, a controller can simply ask for it:

```java
@GetMapping("/me")
Profile me(@AuthenticationPrincipal Jwt jwt) { return profiles.find(jwt.getSubject()); }
```

```trace diagram
id: api-request
title: One request through the security filters
subtitle: "GET /api/orders with a bearer token"
groups:
  - { id: servlet, label: Servlet filter chain }
  - { id: apichain, label: "SecurityFilterChain api (/api/**)" }
elements:
  - { id: client, label: Client, sub: "Authorization: Bearer <JWT>", kind: person }
  - { id: dfp, label: DelegatingFilterProxy, sub: a plain servlet filter, group: servlet }
  - { id: fcp, label: FilterChainProxy, sub: first matching chain wins, group: servlet, kind: system }
  - { id: webchain, label: web chain, sub: "any request, form login", kind: external }
  - { id: bearer, label: BearerToken filter, sub: "JWT → Authentication", group: apichain }
  - { id: context, label: SecurityContextHolder, sub: this request's identity, kind: store, tone: data }
  - { id: etf, label: ExceptionTranslation, sub: catches security exceptions, group: apichain }
  - { id: authz, label: AuthorizationFilter, sub: authorizeHttpRequests rules, group: apichain }
  - { id: dispatcher, label: DispatcherServlet, sub: your controllers, kind: system, tone: neutral }
  - { id: r401, label: 401 Unauthorized, sub: AuthenticationEntryPoint, kind: person }
  - { id: r403, label: 403 Forbidden, sub: AccessDeniedHandler, kind: person }
edges:
  - { id: http, from: client, to: dfp }
  - { id: delegate, from: dfp, to: fcp, label: delegates to the bean }
  - { id: match, from: fcp, to: bearer, label: "/api/** matches" }
  - { id: other, from: fcp, to: webchain, label: other URLs, style: dashed }
  - { id: store, from: bearer, to: context, label: store }
  - { id: next1, from: bearer, to: etf }
  - { id: next2, from: etf, to: authz }
  - { id: who, from: authz, to: context, label: reads, style: dotted }
  - { id: allowed, from: authz, to: dispatcher, label: allowed }
  - { id: anon, from: etf, to: r401, label: not authenticated, style: dashed }
  - { id: denied, from: etf, to: r403, label: authenticated, style: dashed }
steps:
  - caption: "The servlet container knows only one Spring Security filter, DelegatingFilterProxy. It hands the request to the FilterChainProxy bean, which holds the real security filters."
    focus: [client, dfp, fcp]
    trace: [http, delegate]
  - caption: "FilterChainProxy tries each SecurityFilterChain in order and runs only the first one that matches. /api/orders matches the api chain, so the catch-all web chain is never consulted."
    focus: [fcp, apichain, webchain]
    trace: [match]
  - caption: "Its filters run in a fixed order. Early ones write security headers and load any existing context; this stateless API has none, and CSRF is off because bearer tokens aren't sent automatically by browsers."
    focus: [apichain]
  - caption: "The bearer token filter reads the Authorization header and has the AuthenticationManager validate the JWT. On success the resulting Authentication is stored in the SecurityContextHolder for this request."
    focus: [bearer, context]
    trace: [store]
  - caption: "With no token at all, that filter does nothing, and the anonymous filter later in the chain sets an anonymous identity instead. The request carries on either way."
    focus: [bearer, context]
  - caption: "ExceptionTranslationFilter calls the rest of the chain inside a try block. On the way in it does nothing; it is there to catch what the next filter throws."
    focus: [etf, authz]
    trace: [next1, next2]
  - caption: "AuthorizationFilter reads the Authentication and checks the authorizeHttpRequests rules, first match wins. Any authenticated caller may read orders, so the request goes on to the DispatcherServlet."
    focus: [context, authz, dispatcher]
    trace: [who, allowed]
  - caption: "Had the caller been anonymous, AuthorizationFilter would throw AccessDeniedException. ExceptionTranslationFilter catches it, clears the context, and starts authentication through the entry point: a 401."
    focus: [authz, etf, r401]
    trace: [anon]
  - caption: "Had the caller been authenticated but without the role, say on /api/admin, the same exception goes to the AccessDeniedHandler instead: a 403."
    focus: [authz, etf, r403]
    trace: [denied]
  - caption: "On success your controller can read the caller from the context, for example with @AuthenticationPrincipal. When the request ends, FilterChainProxy clears the context so it never leaks into the next request on that thread."
    focus: [context, dispatcher, fcp]
note: "Set logging for org.springframework.security to DEBUG to see the exact filter list of each chain at start-up."
```
