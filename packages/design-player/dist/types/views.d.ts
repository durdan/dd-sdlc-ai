import type { Catalog } from "./catalog";
import type { DiagramLayout } from "./diagram/layout";
import type { Manifest, Walkthrough } from "./types";
export declare function LibraryPage({ catalog, open, initialTab, heading, intro, }: {
    catalog: Catalog;
    open?: (url: string) => void;
    initialTab?: string;
    heading?: string;
    intro?: string;
}): import("react").JSX.Element;
export declare function TopicPage({ catalog, walkthrough, layouts, manifest, chapter, open, library, autoplay, }: {
    catalog: Catalog;
    walkthrough: Walkthrough;
    layouts: Record<string, DiagramLayout>;
    manifest: Manifest;
    chapter?: string;
    open?: (url: string) => void;
    library?: () => void;
    /** Overrides the remembered "user tapped" signal. */
    autoplay?: boolean;
}): import("react").JSX.Element;
