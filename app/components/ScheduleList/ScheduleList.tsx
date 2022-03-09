import React from 'react';
import clsx from 'clsx';
import BinIcon from '@resources/svg/bin.svg';
import { ReleaseSchedule } from '@concordium/node-sdk/';
import Button from '~/cross-app-components/Button';
import { displayAsCcd } from '~/utils/ccd';
import { getFormattedDateString } from '~/utils/timeHelpers';
import styles from './ScheduleList.module.scss';

interface Props {
    schedule: ReleaseSchedule[];
    removeFromSchedule?: (index: number) => void;
    className?: string;
    elementClassName?: string;
    showIndex?: boolean;
}

export default function ScheduleList({
    schedule,
    removeFromSchedule,
    elementClassName,
    className,
    showIndex = true,
}: Props) {
    return (
        <div className={clsx(styles.scheduleList, className)}>
            {schedule.map((schedulePoint, index) => (
                <div
                    key={
                        schedulePoint.timestamp.toString() +
                        schedulePoint.amount.toString()
                    }
                    className={clsx(styles.scheduleListRow, elementClassName)}
                >
                    <div>
                        {showIndex ?? `${index + 1}. `}
                        {getFormattedDateString(schedulePoint.timestamp)}
                    </div>
                    <div>
                        {displayAsCcd(schedulePoint.amount)}{' '}
                        {removeFromSchedule ? (
                            <Button
                                clear
                                onClick={() => removeFromSchedule(index)}
                            >
                                <BinIcon className={styles.binIcon} />
                            </Button>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}
