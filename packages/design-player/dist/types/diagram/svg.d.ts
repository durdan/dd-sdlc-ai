import type { Change, Diagram, DiagramEdge, DiagramElement, EdgeStyle, Flow, Role, Status, Tone } from "../types";
import type { DiagramLayout, Point } from "./layout";
type Swatch = {
    fill: string;
    stroke: string;
};
/** One colour per role, soft enough to sit beside the brand teal. */
export declare const ROLES: Record<Role, Swatch & {
    label: string;
    icon: string;
}>;
/** State diagrams: one colour and icon per kind of state. */
export declare const STATUSES: Record<Status, Swatch & {
    label: string;
    icon: string;
}>;
/** Delta diagrams: added, removed and changed parts. */
export declare const CHANGES: Record<Change, {
    stroke: string;
    dash: string;
    label: string;
    mark: string;
}>;
export declare const TONES: Record<Tone, Swatch>;
/**
 * What a box is: given, or from its kind (person, external), its own words, its
 * kind again (a store is data unless its words say cache or queue), then its tone;
 * a service otherwise. Words beat tone: tones were often used for emphasis.
 */
export declare function roleOf(e: {
    role?: Role;
    tone?: Tone;
    kind?: DiagramElement["kind"];
    label: string;
    sub?: string;
}): Role;
/** Arrow colours and dashes by what they carry. */
export declare const FLOWS: Record<Flow, {
    stroke: string;
    dash: string;
    label: string;
}>;
/** Edge styles as before (legends in the player use them). */
export declare const EDGE: Record<EdgeStyle, {
    stroke: string;
    dash: string;
}>;
export declare const flowOf: (e: Pick<DiagramEdge, "flow" | "style">) => Flow;
/** The roles and flows a diagram uses, with counts, for a legend. */
export declare function legendOf(d: Diagram): {
    roles: {
        fill: string;
        stroke: string;
        label: string;
        icon: string;
        role: string;
        n: number;
    }[];
    flows: {
        stroke: string;
        dash: string;
        label: string;
        flow: Flow;
        n: number;
    }[];
    changes: {
        stroke: string;
        dash: string;
        label: string;
        mark: string;
        change: Change;
        n: number;
    }[];
    final: boolean;
};
/** Orthogonal polyline as a path with small rounded corners. */
export declare function pathD(points: Point[], r?: number): string;
export declare function renderSvg(d: Diagram, layout: DiagramLayout, opts?: {
    pad?: number;
}): string;
export {};
