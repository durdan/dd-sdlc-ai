import { type TopicNav } from "./Watch";
import type { DiagramLayout } from "./diagram/layout";
import type { Depth, Manifest, Walkthrough } from "./types";
export declare function Player({ walkthrough: w, manifest, layouts, nav, autoplay, startAt, startChapter, onProgress, frame, view, initialDepth, }: {
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
    /**
     * Clip mode, for exporting video: the caller sets the time (ms) and the player
     * shows exactly that moment, with no clock, audio or controls. Shots flow into
     * each other as in playback, so frames must be asked for in order.
     */
    frame?: number;
    /** Clip mode only: a fixed camera for diagram shots (an SVG viewBox), set by a film. */
    view?: string;
    initialDepth?: Depth;
}): import("react").JSX.Element;
