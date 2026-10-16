---
id: spring-transactions
title: "Transactions: @Transactional and its traps"
summary: A proxy that begins, commits and rolls back for you
why: A misplaced @Transactional is silent; the code works in a demo, then half-writes data the first time something fails in production.
requires: [spring-filters]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: It is a proxy
    text: "@Transactional works because callers hold a proxy that opens a transaction, calls your method, then commits or rolls back."
  - title: Self-invocation skips it
    text: Calling a transactional method from another method of the same bean goes around the proxy, so no transaction starts.
  - title: Unchecked exceptions roll back
    text: By default RuntimeException and Error roll back; checked exceptions commit unless you say rollbackFor.
  - title: Propagation decides nesting
    text: REQUIRED joins the caller's transaction; REQUIRES_NEW suspends it and runs an independent one.
quiz_hint: For each call, ask whether it went through the proxy, and what kind of exception left the method.
quiz:
  - q: What happens when placeOrder() runs?
    code: |
      @Service
      class OrderService {
        public void placeOrder(Order o) {
          save(o);          // called on this
        }
        @Transactional
        public void save(Order o) { ... }
      }
    options:
      - save() runs in a new transaction
      - save() runs without a transaction, because the call does not go through the proxy
      - Spring throws an exception at start-up
    answer: 1
    explain: The proxy only sees calls from outside the bean. Put @Transactional on placeOrder, or move save into another bean that OrderService calls.
  - q: A @Transactional method throws IOException (a checked exception) after two inserts. What happens to the inserts?
    options:
      - They are rolled back
      - They are committed, because by default only unchecked exceptions and errors cause a rollback
      - It depends on the database
    answer: 1
    explain: Spring follows the EJB convention. Use @Transactional(rollbackFor = Exception.class), or wrap the checked exception in an unchecked one, if a checked failure should undo the work.
  - q: The outer method (REQUIRED) calls audit() marked REQUIRES_NEW, then throws. What is kept?
    options:
      - Nothing; everything rolls back together
      - The audit row; it was committed in its own transaction before the outer one rolled back
      - Only the outer method's writes
    answer: 1
    explain: REQUIRES_NEW suspends the outer transaction and commits independently, using a second connection from the pool meanwhile. That is what you want for audit logs, and a reason to size the pool with care.
links:
  - title: Using @Transactional (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/annotations.html
  - title: Transaction propagation (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/tx-propagation.html
  - title: Understanding declarative transaction implementation (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/tx-decl-explained.html
  - title: Rolling back a declarative transaction (Spring Framework 6.2)
    url: https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/rolling-back.html
---
`@Transactional` looks like a keyword but is an AOP proxy. When another bean calls a transactional method, it is really calling a generated subclass that asks the `PlatformTransactionManager` to begin (or join) a transaction, binds the database connection to the current thread, calls your method, and then commits, or rolls back if a qualifying exception escaped. Everything the method does through Spring-managed data access uses that one connection.

## What the proxy does

```java
@Service
class TransferService {
  private final AccountRepository accounts;
  TransferService(AccountRepository accounts) { this.accounts = accounts; }

  @Transactional
  public void transfer(long from, long to, BigDecimal amount) {
    accounts.debit(from, amount);
    accounts.credit(to, amount);      // if this throws, the debit is undone too
  }

  @Transactional(readOnly = true)
  public BigDecimal balance(long id) { return accounts.balanceOf(id); }
}
```

In pseudo-code, the proxy's version of `transfer` is: get or start a transaction, call the real method, commit; on `RuntimeException` or `Error`, roll back and rethrow. `readOnly = true` is an optimisation hint: Hibernate can skip dirty checking, and the JDBC connection is flagged read-only, which some setups use to route to a replica. It is not a security boundary.

## The self-invocation trap

Because the behaviour lives in the proxy, a call on `this` bypasses it:

```java
public void importAll(List<Row> rows) {
  for (Row r : rows) importOne(r);   // no transaction per row: this.importOne
}

@Transactional
public void importOne(Row r) { ... }
```

Fixes, in order of preference: put the annotation on the outer method if that is the unit you want; move `importOne` to a separate bean; or use a `TransactionTemplate` to make the boundary explicit in code. The same trap applies to `@Async`, `@Cacheable` and `@PreAuthorize`.

Other quiet failures of the same kind: the bean was created with `new` instead of by the container, or the method is `private` or `final`, which a subclass proxy cannot override. Since Spring 6.0, `protected` and package-private methods are proxied for class-based proxies, but `public` remains the safe habit.

## Rollback rules

```java
@Transactional(rollbackFor = PaymentDeclinedException.class)
public void charge(...) throws PaymentDeclinedException { ... }
```

Checked exceptions commit by default. Catching an exception inside the method and not rethrowing also means commit, because the proxy never sees it.

## Propagation

| Setting | Behaviour |
| --- | --- |
| `REQUIRED` (default) | Join the current transaction, or start one |
| `REQUIRES_NEW` | Suspend the current one, start an independent one |
| `MANDATORY` | Fail if there is no current transaction |
| `NOT_SUPPORTED` | Suspend the current one, run without |
| `NESTED` | One physical transaction with a savepoint the inner scope can roll back to (needs JDBC savepoint support) |

One subtlety with `REQUIRED`: if an inner method marks the shared transaction rollback-only and the outer method catches the exception and carries on, the commit at the end fails with `UnexpectedRollbackException`. The inner and outer methods are one physical transaction; they succeed or fail together.

## Keep transactions short

A transaction holds a pooled connection from start to finish. Calling a slow HTTP service inside one ties up a connection for the duration; with 10 connections, ten slow calls stall every other request that needs the database. Do the remote call first, then open the transaction to write the result.

```trace diagram
id: proxy-tx
title: Begin, suspend, roll back
subtitle: "createOrder (REQUIRED) calls audit (REQUIRES_NEW), then fails"
kind: sequence
elements:
  - { id: caller, label: Controller }
  - { id: proxy, label: OrderService proxy, role: service }
  - { id: txm, label: Transaction manager }
  - { id: svc, label: OrderService }
  - { id: audit, label: AuditService proxy, role: service }
edges:
  - { id: call, from: caller, to: proxy, label: "createOrder(o)" }
  - { id: begin, from: proxy, to: txm, label: "REQUIRED: none yet, begin tx 1" }
  - { id: run, from: proxy, to: svc, label: "createOrder(o)" }
  - { id: insert, from: svc, to: svc, label: "INSERT order on connection 1" }
  - { id: callaudit, from: svc, to: audit, label: "audit(o)" }
  - { id: suspend, from: audit, to: txm, label: "REQUIRES_NEW: suspend tx 1, begin tx 2" }
  - { id: auditrow, from: audit, to: audit, label: "INSERT audit row on connection 2" }
  - { id: commit2, from: audit, to: txm, label: "commit tx 2, resume tx 1" }
  - { id: boom, from: svc, to: proxy, label: throws IllegalStateException, style: dashed }
  - { id: rollback, from: proxy, to: txm, label: rollback tx 1 }
  - { id: rethrow, from: proxy, to: caller, label: rethrows, style: dashed }
  - { id: callimport, from: caller, to: proxy, label: "importAll(rows)" }
  - { id: passimport, from: proxy, to: svc, label: "importAll: not transactional" }
  - { id: selfcall, from: svc, to: svc, label: "this.importOne(r): no proxy, no tx" }
steps:
  - caption: "The controller calls createOrder, but it holds a proxy, not your OrderService. The proxy asks the transaction manager for a transaction; with REQUIRED and none running, a new one begins and its connection is bound to the thread."
    trace: [call, begin]
  - caption: "Only then does the proxy call your real method. Its repository INSERT runs on that bound connection, inside transaction 1."
    trace: [run, insert]
  - caption: "createOrder calls audit on another bean, so the call goes through that bean's proxy. audit is REQUIRES_NEW: the manager suspends transaction 1 and begins a second one, on a second pooled connection."
    trace: [callaudit, suspend]
  - caption: "The audit row is written and transaction 2 commits on its own. Transaction 1 is resumed, still uncommitted."
    trace: [auditrow, commit2]
  - caption: "Back in createOrder something fails with an unchecked exception. It escapes the method, and the proxy sees it."
    trace: [boom]
  - caption: "RuntimeException and Error mean rollback, so the order INSERT is undone, then the exception is rethrown. The audit row stays: it was committed independently. A checked exception would have committed, unless rollbackFor says otherwise."
    trace: [rollback, rethrow]
  - caption: "Now the trap. The controller calls importAll, which has no @Transactional, so the proxy just passes the call through."
    trace: [callimport, passimport]
  - caption: "importAll calls this.importOne for each row. this is the real object, not the proxy, so importOne's @Transactional is never seen and no transaction starts. Annotate importAll, or move importOne to another bean."
    trace: [selfcall]
note: "REQUIRES_NEW holds two connections at once; with every thread doing it, a small pool can lock up."
```
