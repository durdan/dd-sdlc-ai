import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "System Design Guide - Master 113+ Architecture Patterns",
  description: "Interactive system design learning platform with 113+ guides covering caching, databases, load balancing, messaging, microservices, and real-world architectures from Netflix, Uber, Twitter, and more.",
  keywords: [
    "system design",
    "architecture patterns",
    "microservices",
    "distributed systems",
    "caching strategies",
    "database sharding",
    "load balancing",
    "API design",
    "interview preparation",
    "software architecture",
    "Netflix architecture",
    "Uber architecture",
    "Twitter architecture",
  ],
  openGraph: {
    title: "System Design Guide - Master 113+ Architecture Patterns",
    description: "Interactive learning platform with diagrams, quizzes, and roadmaps for mastering system design concepts.",
    type: "website",
  },
}

export default function SystemDesignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
