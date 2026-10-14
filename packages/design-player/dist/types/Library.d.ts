import type { Catalog } from "./catalog";
import { type Progress } from "./navigation";
export declare function Library({ catalog, progress, open, initialTab, }: {
    catalog: Catalog;
    progress: Record<string, Progress>;
    open: (url: string) => void;
    initialTab?: string;
}): import("react").JSX.Element;
