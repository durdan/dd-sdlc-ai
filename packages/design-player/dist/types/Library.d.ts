import type { Catalog } from "./catalog";
import { type Progress } from "./navigation";
export declare function Library({ catalog, progress, open, initialTab, heading, intro, }: {
    catalog: Catalog;
    progress: Record<string, Progress>;
    open: (url: string) => void;
    initialTab?: string;
    /** The library's title and one-line introduction; a host can word them for its own site. */
    heading?: string;
    intro?: string;
}): import("react").JSX.Element;
