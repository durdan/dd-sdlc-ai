import type { Diagram, EdgeStyle, Tone } from "../types";
import type { DiagramLayout, Point } from "./layout";
export declare const TONES: Record<Tone, {
    fill: string;
    stroke: string;
}>;
export declare const EDGE: Record<EdgeStyle, {
    stroke: string;
    dash: string;
}>;
/** Orthogonal polyline as a path with small rounded corners. */
export declare function pathD(points: Point[], r?: number): string;
export declare function renderSvg(d: Diagram, layout: DiagramLayout, opts?: {
    pad?: number;
}): string;
