import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { FoundationAccount } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import DisplayAddress from '~/components/DisplayAddress';

import styles from './FoundationAccount.module.scss';

interface Props extends ChainData {
    foundationAccount: FoundationAccount;
}

/**
 * Displays an overview of a foundation account transaction payload.
 */
export default withChainData(function FoundationAccountView({
    foundationAccount,
    chainParameters,
}: Props) {
    if (!chainParameters) {
        return <Loading inline />;
    }

    const currentFoundationAccount = chainParameters.foundationAccount;

    return (
        <>
            <div>
                <h5 className="mB0">Current foundation account address:</h5>
                <DisplayAddress
                    className="mT5"
                    lineClassName={styles.accountAddress}
                    address={currentFoundationAccount.toString()}
                />
            </div>
            <div>
                <h5 className="mB0">New foundation account address:</h5>
                <DisplayAddress
                    className="mT5"
                    lineClassName={styles.accountAddress}
                    address={foundationAccount.address}
                />
            </div>
        </>
    );
});
