import type { Diagram, DiagramElement } from "../types";
export interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface Point {
    x: number;
    y: number;
}
export interface EdgeLayout {
    points: Point[];
    label?: Point & {
        w: number;
        h: number;
    };
}
export interface DiagramLayout {
    width: number;
    height: number;
    nodes: Record<string, Box>;
    groups: Record<string, Box>;
    edges: Record<string, EdgeLayout>;
}
export declare function nodeSize(e: DiagramElement): {
    w: number;
    h: number;
};
export declare function layoutDiagram(d: Diagram): Promise<DiagramLayout>;
