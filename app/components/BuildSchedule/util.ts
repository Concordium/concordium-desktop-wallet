export interface ScheduledTransferBuilderRef {
    canSubmit: boolean;
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
}
