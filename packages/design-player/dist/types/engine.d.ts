import type { Depth, Manifest, Shot, Walkthrough } from "./types";
export declare const GAP_MS = 600;
export declare function readMs(text: string): number;
export declare function clipKey(shot: Shot, depth: Depth): string;
export declare function shotDurations(shots: Shot[], depth: Depth, manifest: Manifest): number[];
export declare function starts(durs: number[]): number[];
/** Shot index and offset within it for a global time. */
export declare function locate(t: number, durs: number[]): {
    index: number;
    offset: number;
};
export interface ChapterMark {
    id: string;
    title: string;
    start: number;
}
export declare function chapterMarks(w: Walkthrough, startTimes: number[]): ChapterMark[];
/** Subtitle chunks: a sentence, or about fourteen words. */
export declare function subtitleChunks(text: string): string[];
/** Which chunk is being spoken, by share of words elapsed. */
export declare function chunkAt(chunks: string[], fraction: number): string;
export declare function fmt(ms: number): string;
/** The chunk being spoken and how many of its words have been said, for word-by-word highlighting. */
export declare function spokenChunk(chunks: string[], fraction: number): {
    words: string[];
    said: number;
};
