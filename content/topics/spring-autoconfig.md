---
id: spring-autoconfig
title: Auto-configuration and starters
summary: How a jar on the classpath becomes a working bean
why: When Boot does something you didn't ask for, or doesn't do something you expected, the answer is always in a condition, and you can read which one.
requires: [spring-ioc]
lesson: none
points:
  - title: Starters bring jars
    text: A starter is just a dependency bundle. Adding spring-boot-starter-web puts Spring MVC, Jackson and Tomcat on the classpath.
  - title: Auto-configurations bring beans
    text: Ordinary @Configuration classes listed in an imports file, each guarded by conditions.
  - title: Conditions decide
    text: "Typical guards: is this class on the classpath, is this property set, has the user already defined this bean?"
  - title: Your bean wins
    text: Most auto-configured beans are @ConditionalOnMissingBean, so declaring your own makes Boot's version back away.
quiz_hint: Look at which condition each auto-configured bean is guarded by, and whether your own bean changes it.
quiz:
  - q: You declare your own ObjectMapper bean. What happens to the one Boot's Jackson auto-configuration would create?
    options:
      - Both exist and injection fails as ambiguous
      - "Boot's is skipped because it is @ConditionalOnMissingBean"
      - Yours is ignored and Boot's is used
    answer: 1
    explain: Auto-configuration runs after your own configuration and checks whether a bean of that type already exists. Because yours does, Boot's version does not register.
  - q: How do you find out why DataSourceAutoConfiguration did or did not apply?
    options:
      - Read the Boot source code
      - Start with --debug (or debug=true) and read the conditions evaluation report
      - Set logging.level.root=TRACE and search the output
    answer: 1
    explain: The report lists positive and negative matches with the exact condition that passed or failed, such as a missing class or a property that was not set. Actuator's conditions endpoint shows the same report at runtime.
  - q: Where does Spring Boot 3 look for the list of auto-configuration classes in a jar?
    options:
      - META-INF/spring.factories under EnableAutoConfiguration
      - META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
      - Any class annotated with @Configuration on the classpath
    answer: 1
    explain: Boot 2.7 introduced the imports file and Boot 3 dropped auto-configuration registration through spring.factories. Each line of the file names one @AutoConfiguration class.
links:
  - title: Auto-configuration (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/using/auto-configuration.html
  - title: Creating your own auto-configuration (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/features/developing-auto-configuration.html
  - title: Build systems and starters (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/using/build-systems.html
---
Spring Boot's best trick is that adding a dependency changes what your application does. Put `spring-boot-starter-data-jpa` on the classpath and, with no code, you get a `DataSource`, a connection pool, an `EntityManagerFactory`, a transaction manager and repository support. None of that is magic: it is a long list of ordinary configuration classes, each of which asks a few yes-or-no questions before it registers any beans.

## Starters and auto-configurations are different things

A **starter** is a Maven or Gradle dependency with no code of its own; it pulls in a coherent set of libraries. An **auto-configuration** is a class marked `@AutoConfiguration`, shipped mostly in `spring-boot-autoconfigure`, and listed in a file called `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`. `@SpringBootApplication` includes `@EnableAutoConfiguration`, which reads those files from every jar and evaluates each class after your own configuration has been registered.

## Conditions

A simplified version of what Boot does for a connection pool looks like this:

```java
@AutoConfiguration
@ConditionalOnClass(DataSource.class)              // the JDBC API is present
@EnableConfigurationProperties(DataSourceProperties.class)
public class MyDataSourceAutoConfiguration {

  @Bean
  @ConditionalOnMissingBean(DataSource.class)       // you haven't made one
  @ConditionalOnProperty(prefix = "spring.datasource", name = "url")
  DataSource dataSource(DataSourceProperties props) {
    return props.initializeDataSourceBuilder().build();
  }
}
```

The conditions you will see most:

- `@ConditionalOnClass` / `@ConditionalOnMissingClass`: is a library on the classpath?
- `@ConditionalOnBean` / `@ConditionalOnMissingBean`: has someone already defined this?
- `@ConditionalOnProperty`: is a property set (by default, present and not `false`)?
- `@ConditionalOnWebApplication`: is this a servlet or reactive web app?

Because the auto-configuration runs last and backs away when your bean exists, the way to customise Boot is usually to declare the bean yourself, or, better still, to set a property that Boot's own bean reads.

## Seeing the decisions

Start the application with `--debug` (or `debug=true` in `application.properties`) and Boot prints a **conditions evaluation report**: every auto-configuration, whether it matched, and which condition decided. With Actuator, `/actuator/conditions` shows the same at runtime, if you expose it.

```text
DataSourceAutoConfiguration matched:
   - @ConditionalOnClass found required classes 'javax.sql.DataSource', ...
MongoAutoConfiguration:
   Did not match:
      - @ConditionalOnClass did not find required class 'com.mongodb.client.MongoClient'
```

To switch one off entirely:

```java
@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)
public class App { }
```

The same mechanism is open to you: a company "starter" for logging or tracing is an auto-configuration class, an imports file and a few conditions, so teams get sensible defaults they can still override.
