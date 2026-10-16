---
id: spring-config
title: Configuration, profiles and externalised config
summary: One build, many environments
why: The same jar should run on a laptop, in staging and in production; only the configuration around it should change, and you should know which value wins.
requires: [spring-autoconfig]
lesson: none
points:
  - title: Many sources, one Environment
    text: Files, environment variables, system properties and command-line arguments are layered into one set of properties.
  - title: Later sources win
    text: Command-line arguments beat environment variables, which beat application.properties inside the jar.
  - title: Profiles add a layer
    text: application-prod.yml is read on top of application.yml when the prod profile is active.
  - title: Bind to types
    text: "@ConfigurationProperties turns a prefix into a validated, immutable object instead of scattered @Value strings."
quiz_hint: Picture the sources as a stack; the one nearest the top that defines the key wins.
quiz:
  - q: application.yml in the jar sets server.port=8080 and the container sets SERVER_PORT=9000. Which port is used?
    options: ["8080", "9000", "Start-up fails with a conflict"]
    answer: 1
    explain: OS environment variables come after config data files in Boot's ordering, so they override them. Relaxed binding maps SERVER_PORT to server.port.
  - q: Which is the safest way to give the application a database password in production?
    options:
      - Commit it in application-prod.yml
      - Supply it from outside the jar, for example as an environment variable or a mounted secret, and reference it as a property
      - Hard-code it in a @Bean method
    answer: 1
    explain: Externalised config means secrets never enter the build artefact or source control. Boot reads environment variables and config trees (such as Kubernetes secret mounts) with the same property names.
  - q: No profile is activated. Which profile files does Boot read?
    options:
      - None besides application.yml
      - application-default.yml (if it exists) on top of application.yml
      - Every application-*.yml it can find
    answer: 1
    explain: When nothing is active, the profile named default is. Files for other profiles are only read when those profiles are active.
links:
  - title: Externalized configuration (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/features/external-config.html
  - title: Profiles (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/features/profiles.html
  - title: Common application properties (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/appendix/application-properties/index.html
---
Spring Boot reads configuration from many places and merges them into a single `Environment`: `application.properties` or `application.yml` inside the jar, files next to the jar, profile-specific variants, OS environment variables, Java system properties and command-line arguments. Each source can override the ones considered before it, so a default written in the jar can be changed at deploy time without rebuilding.

## Who wins

From weaker to stronger, the sources you will use most are:

1. `application.yml` packaged in the jar
2. `application-{profile}.yml` packaged in the jar
3. The same two files outside the jar (for example in `./config/`)
4. OS environment variables
5. Java system properties (`-Dserver.port=9000`)
6. Command-line arguments (`--server.port=9000`)

Test annotations such as `@SpringBootTest(properties = ...)` and `@DynamicPropertySource` sit higher still. Environment variables use **relaxed binding**: `SPRING_DATASOURCE_URL` sets `spring.datasource.url`, because most shells don't allow dots in variable names.

## Profiles

A profile is a named set of extra configuration. Activate it with `spring.profiles.active` (in any source, often `SPRING_PROFILES_ACTIVE=prod`), and Boot reads `application-prod.yml` on top of the base file. A single YAML file can hold several documents, each tied to a profile:

```yaml
server:
  port: 8080
app:
  payments:
    base-url: https://sandbox.example.com
    timeout: 2s
---
spring:
  config:
    activate:
      on-profile: prod
app:
  payments:
    base-url: https://api.example.com
```

Beans can be limited to a profile with `@Profile("dev")`, but use that sparingly. Each profile-only bean is a code path that your tests may never take. Prefer the same beans everywhere with different property values.

## Typed configuration

`@Value("${app.payments.timeout}")` works, but scatters string keys through the code. `@ConfigurationProperties` binds a whole prefix to one type, converts values (`2s` becomes a `Duration`) and can validate them at start-up:

```java
@ConfigurationProperties(prefix = "app.payments")
@Validated
public record PaymentProperties(
    @NotNull URI baseUrl,
    @DefaultValue("2s") Duration timeout) { }

@SpringBootApplication
@ConfigurationPropertiesScan
public class App { }
```

A record makes the settings immutable, and a missing or malformed value fails the start-up instead of the first payment.

## Secrets

Keep secrets out of the jar and out of Git. Boot reads them from environment variables, from a config tree (a directory where each file name is a key, which is how Kubernetes mounts secrets: `spring.config.import=optional:configtree:/run/secrets/`), or from an external store through a library. The property names stay the same, so the code never knows where a value came from.
