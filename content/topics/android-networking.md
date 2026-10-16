---
id: android-networking
title: Networking with Retrofit and OkHttp
summary: Off the main thread, with timeouts, caching and HTTPS only
why: "Mobile networks are slow, flaky and metered. The defaults decide whether a dead connection hangs a screen for ten seconds or forever, and whether a repeat request costs a round trip."
requires: [android-coroutines]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - { title: "Never on the main thread", text: "Android throws NetworkOnMainThreadException by default. Retrofit's suspend functions move the call off it for you." }
  - { title: "One OkHttpClient", text: "Share a single client so connections, the thread pool and the cache are reused." }
  - { title: "Timeouts are per phase", text: "OkHttp's connect, read and write timeouts default to 10 seconds each; the whole-call timeout defaults to none." }
  - { title: "HTTPS by default", text: "Since Android 9 (API 28) cleartext HTTP is blocked by default; the network security config controls exceptions." }
quiz:
  - q: "An OkHttpClient is built with default settings. A server accepts the connection and then sends one byte every 9 seconds. What happens?"
    options:
      - The call fails after 10 seconds
      - The call can go on for a very long time, because the read timeout applies to each read and there is no call timeout by default
      - OkHttp retries automatically every 9 seconds
    answer: 1
    explain: "The read timeout is the longest gap between bytes, not a total. Set callTimeout to bound the whole request, including redirects and retries."
  - q: Why create one OkHttpClient for the app instead of one per request?
    options:
      - Each client has its own connection pool, dispatcher and cache, so new clients waste connections and memory
      - OkHttp allows only one client per process
      - Retrofit requires it
    answer: 0
    explain: "Reusing the client lets requests reuse warm TCP/TLS connections (and HTTP/2 multiplexing) and share one cache. Use newBuilder() when one call needs different settings."
  - q: Your app targets API 35 and calls http://api.example.com. What happens?
    options:
      - It works, with a warning in Logcat
      - It fails, because cleartext traffic is disabled by default from Android 9 on unless the network security config allows it
      - Android upgrades it to HTTPS automatically
    answer: 1
    explain: "Cleartext is off by default for apps targeting API 28 and higher. Fix the URL; if you truly need HTTP for one host, allow it for that domain only in network_security_config.xml."
links:
  - { title: "Connect to the network (Android Developers)", url: "https://developer.android.com/develop/connectivity/network-ops/connecting" }
  - { title: "Network security configuration (Android Developers)", url: "https://developer.android.com/privacy-and-security/security-config" }
  - { title: "The data layer (Android Developers)", url: "https://developer.android.com/topic/architecture/data-layer" }
---
Your app needs the `INTERNET` permission (a normal permission, granted at install) and a thread that isn't the main one. Most Android apps use OkHttp as the HTTP client and Retrofit on top of it to turn an annotated Kotlin interface into calls. With coroutines, a request is just a suspend function that returns your parsed type or throws.

## The client and the API

```kotlin
interface ShopApi {
    @GET("products/{id}")
    suspend fun product(@Path("id") id: String): ProductDto
}

val client = OkHttpClient.Builder()
    .connectTimeout(10, TimeUnit.SECONDS)
    .readTimeout(15, TimeUnit.SECONDS)
    .callTimeout(30, TimeUnit.SECONDS)             // bounds the whole call; default is no limit
    .cache(Cache(File(context.cacheDir, "http"), 20L * 1024 * 1024))
    .build()

val api = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .client(client)
    .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create(ShopApi::class.java)
```

Retrofit runs suspend calls on OkHttp's own threads, so calling `api.product(id)` from `viewModelScope` is main-safe. A non-2xx response throws `HttpException`; a connection problem throws an `IOException`. Return `Response<T>` instead if you want to inspect status codes without exceptions.

## Timeouts

OkHttp's defaults are 10 seconds for connect, read and write, and **0 (no limit) for the call timeout**. Read and write timeouts measure the gap between packets, so a trickling response can run on far longer than 10 seconds. A `callTimeout` puts a ceiling on everything: DNS, connect, TLS, redirects, the body. Coroutine cancellation (the user leaves the screen and `viewModelScope` is cancelled) cancels the underlying OkHttp call too.

## Caching

With a `Cache` installed, OkHttp follows standard HTTP caching: it serves fresh responses from disk using `Cache-Control` and revalidates stale ones with `ETag`/`If-None-Match` or `Last-Modified`, turning a full download into a `304 Not Modified`. Getting the headers right on the server does most of the work. An `Interceptor` can add headers to every request (auth tokens, a user agent); an authenticator can refresh tokens when a request gets a `401`.

## Security

From Android 9 (API 28), cleartext HTTP is disabled by default. The network security configuration (`res/xml/network_security_config.xml`) lets you allow cleartext for a specific debug host, trust extra CAs in debug builds only, or pin certificates, without code. Treat pinning carefully: a pin that no longer matches the server's certificate breaks every installed copy until users update.

## Flaky networks

- Retry idempotent requests with backoff, not in a tight loop, and not for 4xx errors.
- Check connectivity with `ConnectivityManager` to show an offline state, but don't treat it as a guarantee: "connected" doesn't mean the server is reachable.
- For uploads that must eventually happen, hand them to WorkManager with a network constraint instead of retrying in the ViewModel.
- Keep the network out of the UI: a repository fetches, writes to Room, and the UI observes the database.

**Version note:** OkHttp 4 and 5 are both in wide use; the builder APIs shown here exist in both.

```trace diagram
id: okhttp-call
title: One call through Retrofit and OkHttp
subtitle: From the ViewModel to the server and back
direction: DOWN
elements:
  - { id: vm, label: ViewModel, sub: viewModelScope.launch, row: 0 }
  - { id: api, label: Retrofit interface, sub: "suspend fun product(id)", row: 1 }
  - { id: client, label: OkHttpClient, sub: "one per app, interceptors", row: 2 }
  - { id: cache, label: Cache, sub: on disk, kind: store, row: 3 }
  - { id: pool, label: Connection pool, sub: "5 idle, kept 5 minutes", row: 4 }
  - { id: nsc, label: Network security config, sub: no cleartext from API 28, kind: component, row: 3 }
  - { id: server, label: Server, kind: external, row: 5 }
  - { id: result, label: ProductDto, sub: or HttpException / IOException, kind: person, row: 6 }
edges:
  - { id: call, from: vm, to: api }
  - { id: enqueue, from: api, to: client}
  - { id: lookup, from: client, to: cache }
  - { id: hit, from: cache, to: result, label: fresh hit, style: dashed }
  - { id: connect, from: cache, to: pool}
  - { id: policy, from: nsc, to: pool, label: HTTPS only, style: dotted }
  - { id: https, from: pool, to: server }
  - { id: answer, from: server, to: result }
steps:
  - caption: A Retrofit call is a suspend function on top of OkHttp. One shared OkHttpClient owns the threads, the connection pool and the cache, so every call reuses them.
  - caption: The ViewModel calls a suspend function on the Retrofit interface from viewModelScope. Retrofit turns the annotations into an OkHttp call.
    focus: [vm, api]
    trace: [call]
  - caption: Retrofit runs that call on OkHttp's own threads, so the main thread never blocks. Android would otherwise throw NetworkOnMainThreadException.
    focus: [api, client]
    trace: [enqueue]
  - caption: The client first runs its application interceptors, once per call, even when the answer comes from the cache. That is where the auth token goes; an Authenticator can refresh it after a 401.
    focus: [client]
  - caption: With a Cache installed, a fresh response is served from disk. A stale one is revalidated with If-None-Match, and a 304 Not Modified turns a full download into a few headers.
    focus: [client, cache, result]
    trace: [lookup, hit]
  - caption: On a miss OkHttp takes a warm connection from the pool, which by default keeps up to five idle connections for five minutes, or opens a new one.
    focus: [cache, pool]
    trace: [connect]
  - caption: "From Android 9 (API 28), cleartext HTTP is blocked by default, and network_security_config.xml holds any exceptions. Connect, read and write timeouts are 10 seconds each, but the read timeout is the gap between bytes, not a total."
    focus: [pool, nsc, server]
    trace: [policy, https]
  - caption: The converter parses the body and the coroutine resumes with ProductDto. A non-2xx status throws HttpException and a network failure an IOException. Set callTimeout to bound the whole call; it has no limit by default.
    focus: [server, result, vm]
    trace: [answer]
note: Leaving the screen cancels viewModelScope, which cancels the OkHttp call underneath.
```
