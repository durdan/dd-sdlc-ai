export type ElementKind = "person" | "system" | "container" | "component" | "external" | "store" | "start";
export type Depth = "engineer" | "executive";
/** Colour by meaning, not decoration: one tone per plane or ownership. */
export type Tone = "core" | "stream" | "external" | "data" | "neutral";
export type EdgeStyle = "solid" | "dashed" | "dotted";
/**
 * What a box is, shown by its colour and corner icon. Optional: when it is not
 * given, it is worked out from the tone, the kind and the box's own words.
 */
export type Role = "client" | "service" | "data" | "cache" | "queue" | "security" | "edge" | "external" | "error";
/** What an arrow carries, shown by its colour (and, by default, its dash). */
export type Flow = "main" | "reply" | "async" | "security" | "data" | "blocked";
/** A state in a lifecycle (state) diagram: its colour and icon. */
export type Status = "active" | "waiting" | "success" | "failure" | "decision";
/** In a before/after (delta) diagram: what the change does to a box or arrow. */
export type Change = "added" | "removed" | "changed";
export interface DiagramElement {
    id: string;
    kind: ElementKind;
    label: string;
    sub?: string;
    tone?: Tone;
    role?: Role;
    /** State diagrams: the state's kind, and whether it is a final (terminal) state. */
    status?: Status;
    final?: boolean;
    /** Delta diagrams: added, removed or changed between before and after. */
    change?: Change;
    /** Boundary this element sits inside (a group id). */
    group?: string;
    /** Row (0 = top) when the diagram is laid out in bands; groups then wrap their members. */
    rank?: number;
    /** Optional hand placement; otherwise ELK lays the diagram out. */
    x?: number;
    y?: number;
    w?: number;
    h?: number;
}
export interface DiagramEdge {
    id: string;
    from: string;
    to: string;
    label?: string;
    style?: EdgeStyle;
    flow?: Flow;
    change?: Change;
}
export interface DiagramGroup {
    id: string;
    label: string;
    tone?: Tone;
}
export interface LegendEntry {
    style: EdgeStyle;
    tone: Tone;
    label: string;
}
export interface C4Diagram {
    id: string;
    kind: "c4";
    /** state: a lifecycle (statuses, a start dot, final states); delta: a before/after comparison. */
    variant?: "state" | "delta";
    title: string;
    /** Layout direction for ELK; DOWN reads top to bottom. */
    direction?: "DOWN" | "RIGHT";
    boundary?: {
        label: string;
        x: number;
        y: number;
        w: number;
        h: number;
    };
    groups?: DiagramGroup[];
    legend?: LegendEntry[];
    elements: DiagramElement[];
    edges: DiagramEdge[];
}
export interface SequenceDiagram {
    id: string;
    kind: "sequence";
    title: string;
    participants: {
        id: string;
        label: string;
        role?: Role;
    }[];
    messages: DiagramEdge[];
    /** Shaded bands that group messages: from message `from` to message `to`. */
    phases?: {
        label: string;
        from: string;
        to: string;
    }[];
}
export type Diagram = C4Diagram | SequenceDiagram;
/**
 * A text card shown instead of a diagram, for what is not a diagram:
 * requirements, numbers, trade-offs, recaps. Points appear one by one.
 *   points:  plain bullet points
 *   numbers: "value | label" tiles
 *   compare: "left | right" rows; the first point is the column headings
 */
export interface Card {
    heading: string;
    kind?: "points" | "numbers" | "compare";
    points: string[];
}
export interface Shot {
    id: string;
    /** Short name for this path, used as a tab in the HTML docs. */
    title?: string;
    chapter: string;
    /** Diagram to show; omit when the shot is a card. */
    diagram?: string;
    card?: Card;
    /** Element or participant ids to bring into focus; empty shows the whole diagram. */
    focus: string[];
    /** Edge or message ids to trace, in order. */
    trace: string[];
    engineer: string;
    executive: string;
}
/** Library metadata: how a topic is filed, linked and kept fresh. */
export interface TopicMeta {
    kind: "pattern" | "company";
    /** Patterns: Resilience, Data, Messaging, Caching, Scaling, APIs, Security, Deployment. Companies: an industry (Mobility, Streaming, Payments, …). */
    category: string;
    level: "beginner" | "intermediate" | "advanced";
    /** Topic ids this one relies on: a company's patterns, or a pattern's building blocks. Ids not built yet are allowed. */
    uses?: string[];
    /** Other closely related topic ids (neighbours, alternatives). */
    related?: string[];
    /** One line for the library tile. */
    blurb: string;
    created: string;
    updated: string;
    /** When the facts were last checked against sources (companies). */
    factsChecked?: string;
    changelog?: {
        date: string;
        note: string;
    }[];
}
export interface Walkthrough {
    id: string;
    title: string;
    subtitle?: string;
    voice?: string;
    /** Template this walkthrough follows (scripts/templates.ts); checked by scripts/check.ts. */
    template?: "pattern" | "case-study";
    meta?: TopicMeta;
    diagrams: Diagram[];
    chapters: {
        id: string;
        title: string;
    }[];
    shots: Shot[];
    /** Optional hand-written lines for the automatic teaser (scripts/teaser.ts); the planner prefers them. */
    teaser?: {
        hook?: string;
        captions?: Record<string, string>;
    };
}
/** Narration clips by "<shot>-<depth>", written by scripts/narrate.py. */
export type Manifest = Record<string, {
    file: string;
    ms: number;
}>;
