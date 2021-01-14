import React from 'react';
import { AccountInfo, ScheduleItem, TimeStampUnit } from '../utils/types';
import styles from './Transaction.css';
import { parseTime, fromMicroUnits } from '../utils/transactionHelpers';
import SidedText from './SidedText';

interface Props {
    accountInfo: AccountInfo;
    returnFunction: () => void;
}

export default function ShowReleaseSchedule({
    accountInfo,
    returnFunction,
}: Props) {
    return (
        <div className={styles.centerText}>
            <h2> Release schedule </h2>
            <button onClick={returnFunction} type="submit">
                x
            </button>
            <SidedText left="Release Time:" right="Amount:" />
            {accountInfo.accountReleaseSchedule.schedule.map(
                (item: ScheduleItem) => (
                    <div
                        key={item.timestamp}
                        className={styles.releaseScheduleItem}
                    >
                        <SidedText
                            left={parseTime(
                                item.timestamp,
                                TimeStampUnit.milliSeconds
                            )}
                            right={fromMicroUnits(item.amount)}
                        />
                    </div>
                )
            )}
            <SidedText
                left="Total:"
                right={fromMicroUnits(accountInfo.accountReleaseSchedule.total)}
            />
        </div>
    );
}
