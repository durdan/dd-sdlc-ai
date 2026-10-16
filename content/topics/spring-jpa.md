---
id: spring-jpa
title: Spring Data JPA, lazy loading and N+1
summary: Repositories that write the SQL, and the queries you didn't see
why: A page that runs 1 query in development can run 101 in production; you only notice when the database is the bottleneck.
requires: [spring-transactions]
lesson: diagram
points:
  - title: Interfaces become beans
    text: Spring Data generates a repository implementation at start-up from method names, @Query annotations and the entity type.
  - title: Associations load lazily
    text: A lazy collection is a placeholder that runs a query the first time you touch it, which needs an open persistence context.
  - title: N+1 is one query per row
    text: Loading N parents and then touching each one's lazy children runs one extra query per parent.
  - title: Fetch what the use case needs
    text: Use a fetch join, an @EntityGraph or a DTO projection to load it all in one query.
quiz_hint: Count the SQL statements. One for the list, then ask whether each row triggers another.
quiz:
  - q: How many SQL queries does this run for 50 orders, if Order.items is a lazy @OneToMany?
    code: |
      List<Order> orders = orderRepository.findAll();
      for (Order o : orders) {
        total += o.getItems().size();
      }
    options: ["1", "2", "51"]
    answer: 2
    explain: One query for the orders, then one per order when its items collection is first touched. A fetch join or @EntityGraph(attributePaths = "items") loads them in one query instead.
  - q: A controller returns an entity whose lazy collection is serialised to JSON after the service's transaction has ended. With spring.jpa.open-in-view=false, what happens?
    options:
      - The collection is serialised as empty
      - A LazyInitializationException, because there is no open session to load it
      - Spring reopens a transaction automatically
    answer: 1
    explain: Outside the persistence context, the proxy cannot load. Open-in-view (on by default in Boot, with a start-up warning) hides this by keeping the session open for the whole request, at the cost of holding a connection longer and running queries from the view layer.
  - q: Which is the usual fix for N+1 on a list endpoint?
    options:
      - Switch every association to FetchType.EAGER
      - Load what the endpoint needs in one query, with a JOIN FETCH, an @EntityGraph or a DTO projection
      - Increase the connection pool size
    answer: 1
    explain: EAGER makes every use of the entity pay for the association and can still produce N+1 through separate selects. Choosing the fetch plan per query keeps other use cases cheap.
links:
  - title: JPA query methods (Spring Data JPA 3.5)
    url: https://docs.spring.io/spring-data/jpa/reference/3.5/jpa/query-methods.html
  - title: Repository core concepts (Spring Data JPA 3.5)
    url: https://docs.spring.io/spring-data/jpa/reference/3.5/repositories/core-concepts.html
  - title: SQL databases, JPA and open-in-view (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/data/sql.html
  - title: Accessing data with JPA (spring.io guide)
    url: https://spring.io/guides/gs/accessing-data-jpa
---
Spring Data JPA turns an interface into a working repository. At start-up it reads each method's name or `@Query`, generates the JPQL and creates a proxy bean that runs it through Hibernate, the default JPA provider in Spring Boot. The convenience is real, and so is the cost: the SQL is out of sight, and entities with associations can fire queries you never wrote, one per row.

## Repositories

```java
@Entity
class Order {
  @Id @GeneratedValue Long id;
  @ManyToOne(fetch = FetchType.LAZY) Customer customer;
  @OneToMany(mappedBy = "order") List<OrderItem> items = new ArrayList<>();
  Instant placedAt;
}

interface OrderRepository extends JpaRepository<Order, Long> {
  List<Order> findByCustomerIdAndPlacedAtAfter(Long customerId, Instant since);

  @Query("select o from Order o join fetch o.items where o.customer.id = :id")
  List<Order> findWithItems(@Param("id") Long customerId);

  @EntityGraph(attributePaths = {"items", "customer"})
  List<Order> findTop20ByOrderByPlacedAtDesc();
}
```

Derived queries are parsed from the method name; a typo is a start-up error, not a runtime one. The methods inherited from `JpaRepository` (`save`, `findById`, ...) are transactional, read-only for reads; query methods you declare yourself get no transaction settings unless you annotate them or the interface. Either way, your service should own the transaction that spans several calls.

## Lazy loading

JPA's defaults: `@OneToMany` and `@ManyToMany` are lazy; `@ManyToOne` and `@OneToOne` are **eager** unless you say `fetch = FetchType.LAZY`, which is the safer habit. A lazy association is a proxy or a wrapper collection. Touching it runs a `SELECT` through the persistence context, which must still be open, or you get a `LazyInitializationException`.

Spring Boot enables **open session in view** by default (`spring.jpa.open-in-view=true`) and logs a warning about it at start-up. It keeps the `EntityManager` open until the response is written, so lazy loading from the controller or the JSON serialiser "just works". The cost is that a database connection can be held for the whole request and queries happen far from the code that should own them. Many teams turn it off and fetch deliberately.

## N+1

```java
// 1 query for the orders...
List<Order> orders = repo.findByCustomerIdAndPlacedAtAfter(id, since);
// ...plus 1 per order, the first time items is touched
orders.forEach(o -> o.getItems().size());
```

Fixes, chosen per use case:

- **Fetch join** in a `@Query` (`join fetch o.items`) loads parents and children in one statement. Combined with pagination on a collection, Hibernate paginates in memory and warns, so page the parent ids first.
- **`@EntityGraph`** names the associations to load for one repository method.
- **Batch fetching** (`spring.jpa.properties.hibernate.default_batch_fetch_size=50`) turns N extra queries into N/50.
- **DTO projections** (`select new com.example.OrderRow(o.id, o.placedAt) ...` or an interface projection) skip entities entirely for read-only lists.

## Seeing the SQL

```properties
spring.jpa.show-sql=true
logging.level.org.hibernate.SQL=debug
logging.level.org.hibernate.orm.jdbc.bind=trace
spring.jpa.properties.hibernate.generate_statistics=true
```

Turn these on in a test or locally, call the endpoint once and count the statements. A repeated `select ... from order_item where order_id=?` is N+1, every time.

```trace diagram
id: n-plus-one
title: Fifty orders, fifty-one queries
subtitle: Lazy items, the N+1, and the fetch join that fixes it
kind: sequence
elements:
  - { id: service, label: OrderService }
  - { id: repo, label: OrderRepository }
  - { id: ctx, label: Persistence context }
  - { id: db, label: PostgreSQL }
edges:
  - { id: find, from: service, to: repo, label: findByCustomerIdAndPlacedAtAfter }
  - { id: jpql, from: repo, to: ctx, label: run the derived JPQL }
  - { id: q1, from: ctx, to: db, label: "select ... from orders: 1 query" }
  - { id: list, from: ctx, to: service, label: "50 Orders, items not loaded yet", style: dashed }
  - { id: touch1, from: service, to: ctx, label: "order 1: getItems().size()" }
  - { id: sel1, from: ctx, to: db, label: "select ... from order_item where order_id=?" }
  - { id: rest, from: ctx, to: db, label: "orders 2 to 50: the same select, once each", style: dotted }
  - { id: late, from: service, to: ctx, label: "after commit: getItems()" }
  - { id: lie, from: ctx, to: service, label: LazyInitializationException, style: dashed }
  - { id: fix, from: service, to: repo, label: findWithItems(customerId) }
  - { id: join, from: ctx, to: db, label: "select o, i ... join fetch o.items: 1 query" }
  - { id: full, from: ctx, to: service, label: "orders with items filled in", style: dashed }
steps:
  - caption: The service method is @Transactional, so a persistence context, Hibernate's session, is open for as long as it runs. Every entity loaded inside it is tracked there.
    focus: [service, ctx]
  - caption: The service calls a derived query method. Spring Data built its JPQL from the method name at start-up, and the persistence context turns it into one SQL select on the orders table.
    trace: [find, jpql, q1]
  - caption: Fifty orders come back. Their items are not loaded; each order holds a lazy wrapper collection that only knows which order it belongs to.
    trace: [list]
  - caption: The loop touches the first order's items. The wrapper asks the persistence context, which runs a select on order_item for that one order.
    trace: [touch1, sel1]
  - caption: The second order does the same, and so does every order after it. Fifty orders means fifty extra queries, plus the first one. That is the N+1.
    trace: [rest]
  - caption: In development, with five rows, nobody notices. In production each query is a round trip, and the page holds a pooled connection for all fifty-one of them.
    focus: [ctx, db]
  - caption: Touch the collection after the transaction has ended, with open-in-view off, and there is no open persistence context to load from. The wrapper throws a LazyInitializationException instead.
    trace: [late, lie]
  - caption: The fix is to fetch what this use case needs in one statement. findWithItems has a @Query with join fetch o.items.
    trace: [fix]
  - caption: One select joins orders to their items, and Hibernate fills every items collection from that one result. Touching them now runs no SQL at all.
    trace: [join, full]
  - caption: An @EntityGraph on the method does the same without writing JPQL. Batch fetching with a batch size of fifty cuts the fifty extra queries to one, and a DTO projection skips entities for read-only lists.
    focus: [repo, ctx]
```
