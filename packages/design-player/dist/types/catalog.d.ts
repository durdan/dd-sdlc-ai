import type { TopicMeta } from "./types";
export interface CatalogTopic {
    id: string;
    title: string;
    subtitle?: string;
    template?: string;
    meta?: TopicMeta;
    /** Narrated length in ms per depth (0 when not narrated yet). */
    ms: {
        engineer: number;
        executive: number;
    };
    chapters: {
        id: string;
        title: string;
    }[];
    /** Topics whose `uses` name this one (worked out, never hand-kept). */
    usedBy: string[];
    /** Glob key the app imports the walkthrough by. */
    src: string;
}
export interface LearningPath {
    id: string;
    title: string;
    blurb: string;
    steps: string[];
}
export interface Catalog {
    topics: CatalogTopic[];
    paths: LearningPath[];
}
