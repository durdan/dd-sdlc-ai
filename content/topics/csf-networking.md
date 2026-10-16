---
id: csf-networking
title: "The network stack: TCP, UDP and congestion control"
summary: Unreliable packets at the bottom, a reliable byte stream (or not) on top
why: "Connection timeouts, slow first requests, head-of-line blocking and 'the network is slow but the bandwidth is fine' all come from how TCP and UDP behave."
lesson: none
points:
  - title: Layers
    text: "Applications (HTTP, DNS) run on transports (TCP, UDP, QUIC), which run on IP, which runs on links like Ethernet and Wi-Fi. Each layer only talks to its neighbours."
  - title: IP is best effort
    text: "Packets can be lost, duplicated, reordered or delayed. IP routes each one independently and promises nothing."
  - title: TCP adds reliability
    text: "A three-way handshake, sequence numbers, acknowledgements and retransmission turn packets into an ordered, reliable byte stream."
  - title: Congestion control shares the pipe
    text: "TCP starts slowly and grows its sending window until loss or delay says the path is full, then backs off."
quiz:
  - q: "How many network round trips does a new TCP connection need before the client can send its first byte of request data?"
    options: ["None", "One: SYN out, SYN-ACK back, then the ACK can carry data", "Three"]
    answer: 1
    explain: "The handshake is three packets but one round trip for the client. TLS 1.3 adds another round trip on top, which is part of why reusing connections matters."
  - q: Why do video calls and online games often use UDP rather than TCP?
    options:
      - "UDP is encrypted"
      - "A late packet is useless to them, and TCP would hold back everything after a lost packet until it was retransmitted"
      - "UDP has higher bandwidth"
    answer: 1
    explain: "TCP's in-order delivery causes head-of-line blocking. Real-time apps prefer to skip lost data, and build only the reliability they need on top of UDP."
  - q: A file download over a new connection starts slowly and speeds up over the first second. What is the main reason?
    options:
      - "DNS is still resolving"
      - "TCP slow start: the sender begins with a small congestion window and roughly doubles it every round trip until it detects congestion"
      - "The server's disk is warming up"
    answer: 1
    explain: "Slow start probes for available capacity. On long-distance links with high round-trip times, it takes longer to reach full speed, so short transfers rarely do."
links:
  - { title: "RFC 9293: Transmission Control Protocol (TCP)", url: "https://datatracker.ietf.org/doc/html/rfc9293" }
  - { title: "RFC 768: User Datagram Protocol", url: "https://datatracker.ietf.org/doc/html/rfc768" }
  - { title: "RFC 5681: TCP Congestion Control", url: "https://datatracker.ietf.org/doc/html/rfc5681" }
  - { title: "RFC 9000: QUIC, a UDP-based multiplexed and secure transport", url: "https://datatracker.ietf.org/doc/html/rfc9000" }
---
Networking is built in layers. At the bottom, links such as Ethernet and Wi-Fi move frames between neighbouring machines. IP, the internet layer, gives every host an address and forwards packets hop by hop toward it, with no guarantee they arrive. On top of IP, a transport protocol decides what applications get: TCP provides a reliable, ordered byte stream, and UDP provides individual datagrams with no guarantees at all. Your HTTP request, database query or gRPC call rides on one of them.

## UDP: just datagrams

UDP (RFC 768) adds little to IP: source and destination ports, a length and a checksum. Each datagram is sent on its own; it may be lost, duplicated or reordered, and the sender isn't told. There is no connection set-up, so the first packet can carry data. That suits DNS lookups (one question, one answer, retry if nothing comes back), real-time media and games (where late data is useless), and protocols that want to build their own reliability, like QUIC.

## TCP: a reliable stream

TCP (RFC 9293) turns unreliable packets into an ordered, reliable stream of bytes between two endpoints:

- **Handshake.** The client sends SYN with its initial sequence number, the server answers SYN-ACK with its own, and the client sends ACK. That costs one round trip before data flows.
- **Sequence numbers and acknowledgements.** Every byte is numbered. The receiver acknowledges what it has received in order, and the sender retransmits anything not acknowledged in time or reported missing.
- **Flow control.** The receiver advertises a window: how much it can buffer. A slow reader makes the sender wait instead of being flooded.
- **Teardown.** Each side sends FIN when done. The side that closes first keeps the connection in TIME_WAIT for a while, so delayed packets can't confuse a new connection on the same ports.

Reliability has a cost: if one packet is lost, everything after it waits in the receiver's buffer until the retransmission arrives, even if it belongs to an unrelated request on the same connection. This is **head-of-line blocking**, and it is the main reason HTTP/3 runs over QUIC, which multiplexes independent streams over UDP so a loss on one stream doesn't stall the others.

## Congestion control

Flow control protects the receiver; congestion control protects the network between. The sender keeps a **congestion window**, a limit on unacknowledged data in flight. RFC 5681 describes the classic algorithm:

- **Slow start**: begin with a small window (about 10 packets on modern systems) and roughly double it every round trip.
- **Congestion avoidance**: past a threshold, grow by about one packet per round trip.
- **Back off on loss**: a lost packet is taken as a sign of congestion, so the window is cut, typically in half.

Linux uses CUBIC by default, and Google's BBR estimates bandwidth and round-trip time instead of waiting for loss. All of them mean a new connection starts slow. That is why connection reuse (HTTP keep-alive, connection pools), a CDN close to the user, and fewer round trips matter more than raw bandwidth for most web traffic.

## Ports and sockets

An IP address identifies a host; a port (0 to 65535) identifies an application on it. A TCP connection is identified by four values: source IP, source port, destination IP, destination port. A server listens on one port and accepts many connections, each with a different client address and port. Programs reach all of this through **sockets**, the operating system's interface to the network, which the Linux path explores with `ss` and `strace`.
