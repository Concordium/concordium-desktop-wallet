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
    return (
        <Card className="flexColumn alignCenter relative">
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
                schedule={accountInfo.accountReleaseSchedule.schedule}
            />
        </Card>
    );
}
