import { layoutDiagram, type DiagramLayout } from "../diagram/layout";
import type { Walkthrough } from "../types";
export { layoutDiagram };
/** Every diagram of a walkthrough, plus top-to-bottom versions of left-to-right ones for phones. */
export declare function layoutWalkthrough(w: Walkthrough): Promise<Record<string, DiagramLayout>>;
