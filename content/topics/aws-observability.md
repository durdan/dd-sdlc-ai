---
id: aws-observability
title: "Observability: CloudWatch, X-Ray and OpenTelemetry"
summary: Metrics, logs, traces and the alarms that wake you
why: "Every AWS service emits metrics and can write logs, but nothing alerts you until you create alarms. Knowing what is there by default saves you from finding out from your users."
requires: [aws-compute]
lesson: diagram
points:
  - title: Metrics come free, alarms do not exist yet
    text: "AWS services publish metrics to CloudWatch automatically. You still have to decide which ones matter and alarm on them."
  - title: Logs go to log groups
    text: "Lambda, ECS, API Gateway and agents write to CloudWatch Logs. Retention defaults to never expire, so set it."
  - title: Traces connect the hops
    text: "Distributed tracing follows one request through services. AWS now recommends OpenTelemetry; the X-Ray SDKs entered maintenance mode in February 2026."
  - title: Alarm on symptoms
    text: "Alarm on what users feel (error rate, latency, queue age) rather than every CPU spike."
quiz_hint: Ask what a user would notice first, and which metric shows it.
quiz:
  - q: Your Lambda function's logs from two years ago are still being stored and billed. Why?
    options: ["Lambda keeps logs forever by design and it cannot be changed", "CloudWatch Logs log groups keep data indefinitely unless you set a retention period", "Logs are copied to S3 automatically"]
    answer: 1
    explain: "Retention is set per log group, from one day to ten years or never expire (the default). Set it when you create the group, ideally in infrastructure code."
  - q: Which alarm best catches a stuck SQS consumer?
    options: ["CPUUtilization of the producer", "ApproximateAgeOfOldestMessage on the queue rising above a threshold", "NumberOfMessagesSent dropping"]
    answer: 1
    explain: "If the oldest message keeps getting older, consumers are not keeping up or not running. It is a symptom users will feel as delayed work."
  - q: An alarm on a metric that only exists when errors happen sits in INSUFFICIENT_DATA most of the time. What should you configure?
    options: ["Nothing; that state means healthy", "How the alarm treats missing data, for example treating it as not breaching", "A shorter period"]
    answer: 1
    explain: "Alarms have OK, ALARM and INSUFFICIENT_DATA states. Set TreatMissingData to match what missing points mean for that metric."
links:
  - { title: "Using Amazon CloudWatch alarms (AWS docs)", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html" }
  - { title: "Metrics in Amazon CloudWatch (AWS docs)", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html" }
  - { title: "What is Amazon CloudWatch Logs? (AWS docs)", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html" }
  - { title: "What is AWS X-Ray? (AWS docs)", url: "https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html" }
---
**CloudWatch** is where AWS services report on themselves. Every service publishes **metrics** (an ALB's request count and 5xx errors, an SQS queue's depth, a Lambda function's duration and throttles), most services can write **logs** to CloudWatch Logs, and **alarms** watch metrics and act when they cross thresholds. Tracing, following one request across services, comes from **X-Ray** or, increasingly, **OpenTelemetry** sending to CloudWatch. The data is mostly there by default; the judgement about what to watch is not.

## Metrics

A metric is a time series in a **namespace** (`AWS/SQS`), identified by **dimensions** (`QueueName=orders`). AWS metrics are standard resolution (one-minute points or coarser); custom metrics can be high resolution, down to one second. Publish your own business metrics with `PutMetricData`, or more cheaply by writing structured log lines in the **Embedded Metric Format**, which CloudWatch turns into metrics. Watch dimension cardinality: each unique combination is a separately billed metric.

## Logs

Logs land in **log groups** (one per function or service) and **log streams**. **Logs Insights** queries them with a pipe-based language; **metric filters** turn matching lines into metrics; **subscription filters** stream them to Lambda, Firehose or OpenSearch. Two habits pay off immediately: log JSON, so fields are queryable, and set **retention** on every group, because the default is to keep logs forever.

```sh
fields @timestamp, level, orderId, msg
| filter level = "error"
| stats count() by bin(5m)
```

## Alarms

An alarm evaluates a metric (or a metric math expression, or an anomaly detection band) over periods: for example, "5xx rate above 1 % for 3 of 5 one-minute periods". It is in **OK**, **ALARM** or **INSUFFICIENT_DATA**, and on state change it can notify an SNS topic, scale an Auto Scaling group or run an action. **Composite alarms** combine others to cut noise. Good first alarms for a typical service:

- ALB `HTTPCode_Target_5XX_Count` relative to requests, and `TargetResponseTime` p99.
- `UnHealthyHostCount` above zero for several minutes.
- SQS `ApproximateAgeOfOldestMessage`, and any messages in a DLQ.
- Lambda `Errors`, `Throttles`, and duration near the timeout.
- RDS `FreeStorageSpace`, `DatabaseConnections` and CPU credit balance on burstable instances.

## Traces

A trace follows one request across the load balancer, services, queues and databases, so you can see which hop was slow. **X-Ray** stores and visualises traces; AWS announced that the X-Ray SDKs and daemon entered maintenance mode on 25 February 2026 and recommends instrumenting with **OpenTelemetry** (the AWS Distro for OpenTelemetry, or the CloudWatch agent as collector). CloudWatch **Application Signals** builds service maps and SLOs from that telemetry.

Also turn on **CloudTrail** in every account: it records API calls (who changed the security group, who deleted the bucket), which is an audit log rather than application telemetry, and invaluable after an incident.

```trace diagram
id: telemetry-to-alarm
title: From telemetry to a page
subtitle: Logs, metrics, traces and the alarm on top
groups:
  - { id: cw, label: CloudWatch }
elements:
  - { id: app, label: Your service, sub: "Lambda, ECS or EC2", row: 0 }
  - { id: aws, label: AWS services, sub: "ALB, SQS, RDS", kind: external, row: 0 }
  - { id: logs, label: Logs, sub: "log groups, set retention", kind: store, group: cw, row: 1 }
  - { id: traces, label: Traces, sub: "X-Ray, OpenTelemetry", kind: store, tone: data, group: cw, row: 1 }
  - { id: insights, label: Logs Insights, sub: query fields, kind: component, group: cw, row: 2 }
  - { id: metrics, label: Metrics, sub: "namespace + dimensions", kind: store, group: cw, row: 2 }
  - { id: alarm, label: Alarm, sub: "OK, ALARM, INSUFFICIENT_DATA", kind: component, group: cw, row: 3 }
  - { id: sns, label: SNS topic, sub: pages the on-call engineer, tone: stream, row: 4 }
edges:
  - { id: builtin, from: aws, to: metrics }
  - { id: write-logs, from: app, to: logs }
  - { id: query, from: logs, to: insights }
  - { id: emf, from: logs, to: metrics }
  - { id: watch, from: metrics, to: alarm }
  - { id: notify, from: alarm, to: sns }
  - { id: spans, from: app, to: traces }
steps:
  - caption: "Logs, metrics and traces flow into CloudWatch, and alarms turn them into action. Most of the data is there by default; deciding what to watch is not."
  - caption: "AWS services publish metrics automatically, such as an ALB's 5xx count, an SQS queue's oldest message age or a Lambda function's throttles. Nothing watches them until you add an alarm."
    trace: [builtin]
  - caption: "Your service writes logs to a log group. Log JSON so the fields can be queried, and set retention, because by default log groups keep everything forever."
    trace: [write-logs]
  - caption: "Logs Insights queries those fields, for example counting errors in 5-minute bins."
    trace: [query]
  - caption: "Lines in the Embedded Metric Format, and metric filters, turn log lines into metrics, often more cheaply than calling PutMetricData. Each unique combination of dimensions is billed as a separate metric."
    trace: [emf]
  - caption: "An alarm evaluates a metric over periods, for example 5xx above 1 % in 3 of 5 one-minute periods. It is always in one of three states: OK, ALARM or INSUFFICIENT_DATA."
    trace: [watch]
  - caption: "On a state change it notifies an SNS topic, which pages a person. Alarm on what users feel, such as errors, latency and queue age, not on every CPU spike."
    trace: [notify]
  - caption: "Traces follow one request across services, so you can see which hop was slow. AWS now recommends instrumenting with OpenTelemetry, since the X-Ray SDKs entered maintenance mode in February 2026."
    trace: [spans]
```
