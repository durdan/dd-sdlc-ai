declare class DesignPlayerElement extends HTMLElement {
    static observedAttributes: string[];
    private root?;
    connectedCallback(): void;
    attributeChangedCallback(): void;
    disconnectedCallback(): void;
    private load;
}
export { DesignPlayerElement };
