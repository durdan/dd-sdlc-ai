import type { ComponentProps } from "react";
import "../player.css";
import { Library as LibraryInner } from "../Library";
import { Player as PlayerInner } from "../Player";
import { DiagramStage as DiagramStageInner } from "../DiagramStage";
import { LibraryPage as LibraryPageInner, TopicPage as TopicPageInner } from "../views";
export { useWatchMode } from "../Watch";
export type { TopicNav } from "../Watch";
export declare const Player: (p: ComponentProps<typeof PlayerInner>) => import("react").JSX.Element;
export declare const Library: (p: ComponentProps<typeof LibraryInner>) => import("react").JSX.Element;
export declare const LibraryPage: (p: ComponentProps<typeof LibraryPageInner>) => import("react").JSX.Element;
export declare const TopicPage: (p: ComponentProps<typeof TopicPageInner>) => import("react").JSX.Element;
/** The animated diagram alone: fills its container; the caller picks the shot, its length, the offset and play state. */
export declare const DiagramStage: (p: ComponentProps<typeof DiagramStageInner>) => import("react").JSX.Element;
