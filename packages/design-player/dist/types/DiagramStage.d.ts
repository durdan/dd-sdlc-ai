import type { DiagramLayout } from "./diagram/layout";
import type { Diagram, Shot } from "./types";
export declare function DiagramStage({ diagram, layout: wideLayout, portraitLayout, epoch, shot, shotMs, offsetMs, playing, onSelect, selected, }: {
    diagram: Diagram;
    layout: DiagramLayout;
    /** Top-to-bottom layout of a left-to-right diagram, used when the stage is portrait. */
    portraitLayout?: DiagramLayout;
    /** Bumps on every seek, so re-entering the same shot rebuilds its timeline. */
    epoch: number;
    shot: Shot;
    shotMs: number;
    offsetMs: number;
    playing: boolean;
    onSelect: (id: string) => void;
    selected: string | null;
}): import("react").JSX.Element;
