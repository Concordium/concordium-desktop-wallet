import React from 'react';
import { AccountInfo } from '~/utils/types';
import { displayAsCcd } from '~/utils/ccd';
import Card from '~/cross-app-components/Card';
import ScheduleList from '~/components/ScheduleList';
import SidedRow from '~/components/SidedRow';
import styles from './ShowReleaseSchedule.module.scss';

interface Props {
    accountInfo?: AccountInfo;
}
/**
 * Displays the account's release schedule:
 * Each release (amount and time)
 * and the total locked value.
 */
export default function ShowReleaseSchedule({ accountInfo }: Props) {
    if (!accountInfo) {
        return null;
    }

    const { schedule } = accountInfo.accountReleaseSchedule;

    return (
        <Card className="flexColumn alignCenter relative pB0">
            <h3 className={styles.releaseScheduleTitle}>
                Locked amount:{' '}
                {displayAsCcd(accountInfo.accountReleaseSchedule.total)}
            </h3>
            <SidedRow
                className={styles.releaseScheduleListHeader}
                left="Release date and time"
                right="Amount"
            />
            <ScheduleList
                showIndex={false}
                className={styles.releaseSchedule}
                elementClassName={styles.releaseScheduleElement}
                schedule={schedule}
            />
            {schedule.length === 0 ? (
                <h3 className="flex justifyCenter pB20 mT10">
                    This account has no future releases.
                </h3>
            ) : null}
        </Card>
    );
}
