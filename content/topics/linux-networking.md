---
id: linux-networking
title: "Sockets, ports and DNS resolution"
summary: How a program listens, connects and turns a name into an address
why: "'Connection refused', 'address already in use' and 'works with the IP but not the name' are each one layer of this, and each has a quick check."
requires: [linux-fds, linux-syscalls]
lesson: none
points:
  - title: A socket is a file descriptor
    text: "Programs read and write network connections with the same calls as files, after socket, bind, listen, accept or connect."
  - title: A port belongs to one listener per address
    text: "A server binds an address and port. A second bind to the same pair fails with EADDRINUSE; nothing bound means ECONNREFUSED."
  - title: ss shows what is listening and connected
    text: "ss -ltnp lists listening TCP sockets and the process that owns each one."
  - title: Name lookup is a library job
    text: "getaddrinfo follows /etc/nsswitch.conf: usually /etc/hosts first, then the DNS servers in /etc/resolv.conf."
quiz:
  - q: "curl says 'Connection refused' to 127.0.0.1:8000. What does that tell you?"
    options: ["A firewall dropped the packets", "The host answered, but nothing is listening on that address and port", "DNS failed"]
    answer: 1
    explain: "The kernel replied with a reset because no socket is bound there. Check ss -ltn: often the server listens on another port, or on a different address."
  - q: "A server bound to 127.0.0.1:8000 inside a container is unreachable through a published port. Why?"
    options: ["Ports above 1024 are blocked", "127.0.0.1 accepts connections only from inside the same network namespace; bind 0.0.0.0 to accept from outside", "Containers can't use TCP"]
    answer: 1
    explain: "Loopback is local to the namespace. Traffic forwarded from the host arrives on the container's eth0 address, which a loopback-only listener never sees."
  - q: "dig example.com returns an address but your app can't resolve it. What is a likely difference?"
    options: ["dig uses a different internet", "dig queries DNS directly, while the app goes through getaddrinfo, which also consults /etc/hosts and nsswitch.conf", "The app needs root"]
    answer: 1
    explain: "Use getent hosts example.com to test the same path applications take. An /etc/hosts entry or a different resolver configuration explains the difference."
links:
  - { title: "socket(7) (man7.org)", url: "https://man7.org/linux/man-pages/man7/socket.7.html" }
  - { title: "ss(8) (man7.org)", url: "https://man7.org/linux/man-pages/man8/ss.8.html" }
  - { title: "getaddrinfo(3) (man7.org)", url: "https://man7.org/linux/man-pages/man3/getaddrinfo.3.html" }
  - { title: "nsswitch.conf(5) (man7.org)", url: "https://man7.org/linux/man-pages/man5/nsswitch.conf.5.html" }
---
A socket is the kernel's endpoint for network communication, and to a program it is just another file descriptor. A server creates a socket, binds it to an address and port, calls listen, then accept for each incoming connection, which hands back a new descriptor for that client. A client creates a socket and calls connect. Before any of that, a host name has to become an IP address, which the C library's `getaddrinfo` does by following `/etc/nsswitch.conf`.

## Listen, then look

Start a tiny HTTP server on loopback and ask who is listening:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 > /dev/null 2>&1 &
sleep 1
ss -ltnp
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/
```

```text
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
LISTEN 0      5          127.0.0.1:8000      0.0.0.0:*    users:(("python3",pid=3713,fd=3))
200
```

`-l` listening, `-t` TCP, `-n` numeric, `-p` owning process. The socket is descriptor 3 of the Python process. `Send-Q` on a listening socket is its backlog, the queue of connections waiting for accept. `ss -tn` (without `-l`) lists established connections; each one is identified by four values, local and remote address and port, which is why one listening port can serve thousands of clients. Clients get a temporary "ephemeral" port from the range in `/proc/sys/net/ipv4/ip_local_port_range`.

## Three errors and what they mean

- **EADDRINUSE, "Address already in use".** Something already holds that address and port. `ss -ltnp 'sport = :8000'` names it. Restarted servers may also hit this while old connections sit in TIME_WAIT, which is why servers set `SO_REUSEADDR`.
- **ECONNREFUSED, "Connection refused".** The host answered with a reset because nothing listens there. Wrong port, server not started, or listening on another address.
- **Timeouts.** No answer at all usually means a firewall, security group or routing problem dropping packets, not a missing listener.

Starting a second server on the same port shows the first:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 2>&1 | tail -1
```

```text
OSError: [Errno 98] Address already in use
```

Which address you bind matters. `127.0.0.1` accepts only connections from the same machine, or the same container, since each container has its own network namespace. `0.0.0.0` (or `::` for IPv6) accepts on every interface. Ports below 1024 need root or `CAP_NET_BIND_SERVICE`.

## How a name becomes an address

```sh
grep '^hosts' /etc/nsswitch.conf
grep -v '^#' /etc/resolv.conf
getent hosts example.com
dig +short example.com A
```

```text
hosts:          files dns

nameserver 192.168.65.7

172.66.147.243  example.com
104.20.23.154   example.com
172.66.147.243
104.20.23.154
```

`files dns` means: check `/etc/hosts` first, then ask the DNS servers listed in `/etc/resolv.conf` (here Docker Desktop's built-in resolver). `getent hosts` goes through exactly this path, the same as most applications; `dig` and `nslookup` talk to DNS directly and skip `/etc/hosts`. On systemd machines `/etc/resolv.conf` often points at `127.0.0.53`, the local `systemd-resolved` cache, and `resolvectl query example.com` shows what it does. Addresses you see will differ, since large sites answer with many.

## On macOS

The socket calls are the same, but there is no `ss`: use `lsof -nP -iTCP -sTCP:LISTEN` or `netstat -an`. macOS resolves names through `mDNSResponder`, not `/etc/nsswitch.conf`; `dscacheutil -q host -a name example.com` follows the system path, and `/etc/resolv.conf` exists only for compatibility.
