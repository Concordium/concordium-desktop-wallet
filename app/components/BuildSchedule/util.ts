export interface ScheduledTransferBuilderRef {
    /**
     * Trigger submit of builder component.
     */
    submitSchedule(): void;
}

export interface ScheduledTransferBuilderBaseProps {
    /**
     * Defaults to false.
     */
    hideSubmitButton?: boolean;
    onValidChange?(isValid: boolean): void;
}
