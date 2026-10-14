import type { Catalog, CatalogTopic } from "./catalog";
/** Where the library lives in the host app, and where its assets are served from. */
export declare function configure(opts: {
    base?: string;
    assets?: string;
    audio?: string;
}): void;
/** URL of a library asset ("/thumbs/x.svg", "/audio/x/clip.mp3", "/docs/x.html"). */
export declare const assetUrl: (path: string) => string;
export declare const libraryUrl: (tab?: string) => string;
export type Route = {
    page: "library";
    tab?: string;
} | {
    page: "topic";
    id: string;
    chapter?: string;
};
export declare function topicUrl(t: Pick<CatalogTopic, "id" | "meta">, chapter?: string): string;
export declare function parseRoute(loc?: Location): Route;
export interface Progress {
    /** Position in ms, at the depth last watched. */
    t: number;
    total: number;
    /** When last watched. */
    at: number;
}
export declare function loadProgress(): Record<string, Progress>;
export declare function saveProgress(id: string, t: number, total: number): void;
export declare const fractionOf: (p?: Progress) => number;
export declare const finished: (p?: Progress) => boolean;
export interface NextGroup {
    title: string;
    items: {
        topic: CatalogTopic;
        note?: string;
    }[];
}
/** Sections for the "what next" sheet, and the single topic swiping on should play. */
export declare function whatNext(catalog: Catalog, id: string, progress: Record<string, Progress>): {
    groups: NextGroup[];
    next?: CatalogTopic;
};
/** Topics to offer as chips during a "patterns used / related / in the wild" chapter. */
export declare function linkedTopics(catalog: Catalog, id: string): CatalogTopic[];
export declare const LINK_CHAPTERS: Set<string>;
export declare function isNew(t: CatalogTopic, days?: number): boolean;
export declare function isUpdated(t: CatalogTopic, days?: number): boolean;
