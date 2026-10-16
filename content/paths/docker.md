---
id: docker
title: "Docker: what a container really is"
promise: "What really happens when you run a container: the kernel features that fence in a process, the layered images it starts from, how to build them fast, small and safe, and how networking, storage, signals and Compose fit around it, on a Linux server and on a Mac."
kind: skill
level: intermediate
tags: [devops]
stages:
  - title: What a container is
    blurb: Processes, kernels and images
    topics: [docker-containers, docker-images, docker-desktop]
  - title: Building images
    blurb: Fast, small, multi-arch and pinned
    topics: [docker-dockerfile, docker-multistage, docker-buildkit, docker-registries]
  - title: Running containers
    blurb: Users, networks, state, signals, stacks
    topics: [docker-security, docker-networking, docker-volumes, docker-signals, docker-compose]
bridges:
  - id: service-mesh
    why: "Cheap containers made it practical to run a proxy beside every service. The sidecar pattern, and the service mesh built from it, is the next step."
  - id: graceful-degradation
    why: "Handling SIGTERM well is graceful shutdown for one process. This is the same idea for a whole system when a part of it goes away."
next: [kubernetes]
---
Written for Docker Engine 27 to 29 and Compose v2; changes in Engine 28 (port publishing hardening) and 29 (the containerd image store by default on fresh installs) are called out where they matter. The examples were built and run on Docker Engine 29.1.3 with Docker Desktop 4.55 on Apple silicon, and the outputs shown come from those runs.
