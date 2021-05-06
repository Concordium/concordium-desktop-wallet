import React from 'react';
import BinIcon from '@resources/svg/bin.svg';
import Button from '~/cross-app-components/Button';
import { displayAsGTU } from '~/utils/gtu';
import { parseTime } from '~/utils/timeHelpers';
import { Schedule, TimeStampUnit } from '~/utils/types';
import styles from './ScheduleList.module.scss';

interface Props {
    schedule: Schedule;
    removeFromSchedule?: (index: number) => void;
}

export default function ScheduleList({ schedule, removeFromSchedule }: Props) {
    return (
        <div className={styles.scheduleList}>
            {schedule.map((schedulePoint, index) => (
                <div
                    key={schedulePoint.timestamp + schedulePoint.amount}
                    className={styles.scheduleListRow}
                >
                    <div>
                        {index + 1}.{' '}
                        {parseTime(
                            schedulePoint.timestamp,
                            TimeStampUnit.milliSeconds
                        )}
                    </div>
                    <div>
                        {displayAsGTU(schedulePoint.amount)}{' '}
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
