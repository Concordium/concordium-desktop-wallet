import React from 'react';
import { AccountInfo } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import CloseButton from '~/cross-app-components/CloseButton';
import Card from '~/cross-app-components/Card';
import ScheduleList from '~/components/ScheduleList';
import SidedRow from '~/components/SidedRow';
import styles from './ShowReleaseSchedule.module.scss';

interface Props {
    accountInfo: AccountInfo;
    returnFunction(): void;
}
/**
 * Displays the account's release schedule:
 * Each release (amount and time)
 * and the total locked value.
 */
export default function ShowReleaseSchedule({
    accountInfo,
    returnFunction,
}: Props) {
    const { schedule } = accountInfo.accountReleaseSchedule;
    const releaseSchedule = schedule.map((release) => ({
        timestamp: release.timestamp.getTime().toString(),
        amount: release.amount.toString(),
    }));

    return (
        <Card className="flexColumn alignCenter relative pB0">
            <CloseButton
                className={styles.closeButton}
                onClick={returnFunction}
            />
            <h3 className={styles.releaseScheduleTitle}>
                Locked amount:{' '}
                {displayAsGTU(accountInfo.accountReleaseSchedule.total)}
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
                schedule={releaseSchedule}
            />
            {schedule.length === 0 ? (
                <h3 className="flex justifyCenter pB20 mT10">
                    This account has no future releases.
                </h3>
            ) : null}
        </Card>
    );
}
