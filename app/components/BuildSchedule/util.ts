import { ButtonProps } from '~/cross-app-components/Button';
import { Schedule } from '~/utils/types';

export interface ScheduledTransferBuilderRef {
    /**
     * Trigger submit of builder component.
     */
    submitSchedule(): void;
}

export interface ScheduledTransferBuilderBaseProps {
    submitButtonSize?: ButtonProps['size'];
}

export interface RegularIntervalDefaults {
    releases: number;
    interval: number;
    startTime: number;
    explicit: boolean;
}

export interface ExplicitScheduleDefaults {
    schedule: Schedule;
    explicit: boolean;
}

export interface BuildScheduleDefaults
    extends ExplicitScheduleDefaults,
        RegularIntervalDefaults {}
