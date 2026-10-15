import { type ReactNode } from "react";
import { type ChapterMark } from "./engine";
import type { CatalogTopic } from "./catalog";
import { type NextGroup } from "./navigation";
import type { Depth, Walkthrough } from "./types";
/** Navigation the library gives a playing topic. */
export interface TopicNav {
    groups: NextGroup[];
    next?: CatalogTopic;
    /** Related topics, offered as chips in the patterns / related / in-the-wild chapters. */
    links: CatalogTopic[];
    open: (url: string) => void;
    library: () => void;
}
/** Phones (and ?watch=1 anywhere) get watch mode. */
export declare function useWatchMode(): boolean;
export interface WatchProps {
    w: Walkthrough;
    nav?: TopicNav;
    stage: ReactNode;
    depth: Depth;
    onDepth: (d: Depth) => void;
    time: number;
    total: number;
    playing: boolean;
    toggle: () => void;
    seek: (t: number) => void;
    chapters: ChapterMark[];
    text: string;
    /** Share of the current shot's narration already spoken, 0–1. */
    spoken: number;
    captions: boolean;
    setCaptions: (f: (c: boolean) => boolean) => void;
    speed: number;
    setSpeed: (s: number) => void;
    explore: ReactNode;
    /** Clip mode (video export): no controls, overlays or sheets, just the stage, title and captions. */
    clip?: boolean;
}
export declare function Watch(p: WatchProps): import("react").JSX.Element;
