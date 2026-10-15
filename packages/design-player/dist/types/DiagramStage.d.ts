import type { DiagramLayout } from "./diagram/layout";
import type { Diagram, Shot } from "./types";
export declare function DiagramStage({ diagram, layout: wideLayout, portraitLayout, epoch, shot, shotMs, offsetMs, scrubMs, playing, onSelect, selected, view, }: {
    diagram: Diagram;
    layout: DiagramLayout;
    /** Top-to-bottom layout of a left-to-right diagram, used when the stage is portrait. */
    portraitLayout?: DiagramLayout;
    /** Bumps on every seek, so re-entering the same shot rebuilds its timeline. */
    epoch: number;
    shot: Shot;
    shotMs: number;
    offsetMs: number;
    /** Clip mode: show this moment of the current shot (ms), without rebuilding it. */
    scrubMs?: number;
    playing: boolean;
    onSelect: (id: string) => void;
    selected: string | null;
    /** Fixed camera (an SVG viewBox), for films: no focus zoom or follow moves; the caller moves it. */
    view?: string;
}): import("react").JSX.Element;
