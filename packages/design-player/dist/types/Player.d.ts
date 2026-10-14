import { type TopicNav } from "./Watch";
import type { DiagramLayout } from "./diagram/layout";
import type { Manifest, Walkthrough } from "./types";
export declare function Player({ walkthrough: w, manifest, layouts, nav, autoplay, startAt, startChapter, onProgress, }: {
    walkthrough: Walkthrough;
    manifest: Manifest;
    layouts: Record<string, DiagramLayout>;
    /** What to watch next, related topics, and navigation (from the library). */
    nav?: TopicNav;
    /** Start playing at once (after the user already tapped to switch topic). */
    autoplay?: boolean;
    /** Resume position in ms, unless a chapter is asked for. */
    startAt?: number;
    startChapter?: string;
    onProgress?: (t: number, total: number) => void;
}): import("react").JSX.Element;
