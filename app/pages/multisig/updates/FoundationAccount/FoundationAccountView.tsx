import clsx from 'clsx';
import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { FoundationAccount } from '~/utils/types';
import withChainData, { ChainData } from '../../common/withChainData';

import styles from './FoundationAccount.module.scss';
import { getCurrentValue } from './util';

interface Props extends ChainData {
    foundationAccount: FoundationAccount;
}

/**
 * Displays an overview of a foundation account transaction payload.
 */
export default withChainData(function FoundationAccountView({
    foundationAccount,
    blockSummary,
}: Props) {
    if (!blockSummary) {
        return <Loading inline />;
    }

    const currentFoundationAccount = getCurrentValue(blockSummary);

    return (
        <>
            <div>
                <h5 className="mB0">Current foundation account address:</h5>
                <div className={clsx(styles.accountAddress, 'textFaded')}>
                    {currentFoundationAccount}
                </div>
            </div>
            <div>
                <h5 className="mB0">New foundation account address:</h5>
                <div className={styles.accountAddress}>
                    {foundationAccount.address}
                </div>
            </div>
        </>
    );
});
