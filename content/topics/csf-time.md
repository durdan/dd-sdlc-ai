---
id: csf-time
title: "Time: clocks, time zones, monotonic vs wall clock"
summary: Two kinds of clock, one universal timeline, and a lot of local rules
why: "Negative durations, events in the wrong order, reports that skip an hour and timestamps that shift by a day are all time handling bugs, and they hit every system eventually."
lesson: none
points:
  - title: Wall clock vs monotonic
    text: "The wall clock says what time it is and can jump (NTP corrections, manual changes). A monotonic clock only moves forward, so use it to measure durations."
  - title: Store UTC instants
    text: "Record when something happened as an instant in UTC (or seconds since the Unix epoch). Convert to a local time zone only for display."
  - title: Time zones are rules
    text: "A zone like Europe/Copenhagen is a history of offsets and daylight-saving changes, maintained in the IANA tz database. An offset like +02:00 is not a zone."
  - title: Clocks disagree
    text: "Two machines' clocks are never exactly in sync, so timestamps from different hosts can't reliably order events that are close together."
quiz:
  - q: "You measure a request's duration as Date.now() at the end minus Date.now() at the start, and occasionally get a negative number. Why?"
    options:
      - "The request finished before it started"
      - "Date.now() reads the wall clock, which NTP or an administrator can step backwards; use a monotonic clock such as performance.now()"
      - "Date.now() overflows"
    answer: 1
    explain: "The wall clock follows the time of day, including corrections. Monotonic clocks (performance.now, System.nanoTime, time.monotonic, CLOCK_MONOTONIC) never go backwards."
  - q: "In Europe/Copenhagen on 29 March 2026, clocks went from 01:59:59 to 03:00. A job is scheduled for 02:30 local time every day. What happens that day?"
    options:
      - "It runs at 02:30 as usual"
      - "02:30 doesn't exist that day, so the scheduler must skip it or move it; in autumn 02:30 happens twice"
      - "The time zone changes to UTC"
    answer: 1
    explain: "Daylight-saving transitions create gaps and overlaps in local time. This topic's example showed one minute after 01:59 local being 03:00."
  - q: What should a database column for 'when the order was placed' contain?
    options:
      - "Local time as text, like '29/03/2026 02:30'"
      - "An instant: a UTC timestamp, or a timestamp with time zone that is normalised to UTC"
      - "The user's time zone name only"
    answer: 1
    explain: "Instants are unambiguous and sortable. Store the user's zone separately if you need to show local time or schedule in it later."
links:
  - { title: "IANA Time Zone Database", url: "https://www.iana.org/time-zones" }
  - { title: "RFC 3339: Date and Time on the Internet: Timestamps", url: "https://datatracker.ietf.org/doc/html/rfc3339" }
  - { title: "clock_gettime(2): CLOCK_REALTIME and CLOCK_MONOTONIC (Linux man page)", url: "https://man7.org/linux/man-pages/man2/clock_gettime.2.html" }
  - { title: "performance.now() (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/API/Performance/now" }
---
Computers keep time with a quartz oscillator that counts ticks, and it drifts by a few seconds a day or less. Operating systems correct it with NTP and expose more than one clock on top of it. Getting time right means choosing the right clock for the job, storing instants rather than local times, and leaving time zone rules to a library that tracks the official database.

## Two clocks

- The **wall clock** (`CLOCK_REALTIME` on Linux, `Date.now()` in JavaScript, `System.currentTimeMillis()` in Java) tells you the current date and time, usually as time since the Unix epoch, 1970-01-01T00:00:00Z. It can jump forwards or backwards when NTP steps it, when an administrator changes it, or when a virtual machine resumes.
- The **monotonic clock** (`CLOCK_MONOTONIC`, `performance.now()`, `System.nanoTime()`, Python's `time.monotonic()`) counts from an arbitrary starting point and never goes backwards. Its value means nothing as a date, but differences between two readings are reliable durations.

Use wall-clock time to record when something happened; use monotonic time for timeouts, rate limits, retries and measuring how long something took.

## Instants, offsets and zones

An **instant** is a point on the universal timeline, written in UTC: `2026-03-29T00:30:00Z` in the RFC 3339 format. A **local time** like "01:30 on 29 March" is ambiguous until you know the zone. A **UTC offset** like +01:00 tells you the difference at one moment. A **time zone** like `Europe/Copenhagen` or `America/New_York` is a set of rules (offsets and daylight-saving transitions, past and future) maintained in the IANA tz database, which ships in operating systems, language runtimes and browsers and is updated several times a year when governments change their rules.

```js run
const d = new Date(Date.UTC(2026, 2, 29, 0, 30));
console.log(d.toISOString());
for (const tz of ["UTC", "Europe/Copenhagen", "America/New_York", "Asia/Kolkata"])
  console.log(tz.padEnd(18), d.toLocaleString("en-GB", { timeZone: tz, timeZoneName: "short" }));
const fmt = x => x.toLocaleTimeString("en-GB", { timeZone: "Europe/Copenhagen" });
const before = new Date(Date.UTC(2026, 2, 29, 0, 59));
const after = new Date(Date.UTC(2026, 2, 29, 1, 0));
console.log(fmt(before), "->", fmt(after), "one minute later");
console.log(new Date(2 ** 31 * 1000).toISOString());
```

Node printed the same instant as 0:30 UTC, 1:30 CET, 20:30 the previous day in New York, and 6:00 in Kolkata (a half-hour offset). Then `01:59:00 -> 03:00:00 one minute later`: at 01:00 UTC that night, Denmark moved to summer time, so local times from 02:00 to 02:59 never happened. In October the opposite happens and an hour of local times occurs twice. The last line, `2038-01-19T03:14:08.000Z`, is the moment a signed 32-bit count of seconds since 1970 overflows, the "year 2038 problem" for old systems.

Rules of thumb: store instants in UTC; store the user's IANA zone name separately when you need local behaviour; schedule "every day at 09:00 local" in the zone, not as a fixed UTC time; and never do date arithmetic by adding 86,400 seconds when you mean "same time tomorrow".

## Clocks on different machines

NTP keeps servers within milliseconds of each other on a good network, but never exactly in sync, and a misconfigured host can be seconds off. So timestamps from different machines can't reliably tell you which of two close events happened first, and "last write wins" by timestamp can silently drop updates. Distributed systems use logical clocks (Lamport timestamps, vector clocks), hybrid logical clocks, or, like Google Spanner, clocks with explicit uncertainty bounds. Leap seconds add one more wrinkle; many large providers "smear" them over a day instead of inserting an extra second, and the international timekeeping bodies decided in 2022 to stop adding them by 2035.
