/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withNonce, { AccountAndNonce } from '~/components/Transfers/withNonce';
import { isDefined } from '~/utils/basicHelpers';
import {
    AccountInfo,
    ConfigureBaker as ConfigureBakerTransaction,
    MakeRequired,
    NotOptional,
    OpenStatus,
} from '~/utils/types';
import withChainData from '~/utils/withChainData';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../AccountTransactionFlow';
import { ensureProps } from '~/utils/componentHelpers';
import {
    AddBakerFlowState,
    title,
    convertToTransaction,
    validateValues,
} from '~/utils/transactionFlows/addBaker';
import {
    Dependencies,
    getDefaultCommissions,
} from '~/utils/transactionFlows/configureBaker';
import AddBakerStakePage from '~/components/Transfers/configureBaker/AddBakerStakePage';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';
import KeysPage from '~/components/Transfers/configureBaker/KeysPage';
import routes from '~/constants/routes.json';

interface Props extends Dependencies, NotOptional<AccountAndNonce> {
    accountInfo: AccountInfo;
}

type UnsafeProps = MakeRequired<Partial<Props>, 'account' | 'accountInfo'>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.nonce, props.blockSummary].every(
        isDefined
    );
};

const withDeps = (component: ComponentType<Props>) =>
    withNonce(
        withExchangeRate(
            withChainData(
                ensureProps(
                    component,
                    hasNecessaryProps,
                    <AccountTransactionFlowLoading title={title} />
                )
            )
        )
    );

export default withDeps(function AddBaker(props: Props) {
    const { nonce, account, exchangeRate, blockSummary, accountInfo } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToTransaction(
            getDefaultCommissions(),
            account,
            nonce,
            exchangeRate
        ),
        [account, nonce, exchangeRate]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const validate = useCallback(
        validateValues(blockSummary, account, accountInfo, exchangeRate),
        [blockSummary, account, accountInfo, exchangeRate]
    );

    return (
        <AccountTransactionFlow<AddBakerFlowState, ConfigureBakerTransaction>
            title={title}
            convert={convert}
            validate={validate}
            multisigRoute={routes.MULTISIGTRANSACTIONS_ADD_BAKER}
        >
            {({ openForDelegation }) => ({
                stake: {
                    render: (initial, onNext, formValues) => (
                        <AddBakerStakePage
                            account={account}
                            exchangeRate={exchangeRate}
                            blockSummary={blockSummary}
                            initial={initial}
                            onNext={onNext}
                            formValues={formValues}
                        />
                    ),
                },
                openForDelegation: {
                    render: (initial, onNext) => (
                        <DelegationStatusPage
                            initial={initial}
                            onNext={onNext}
                            account={account}
                        />
                    ),
                    title: 'Pool settings',
                },
                commissions:
                    openForDelegation !== OpenStatus.ClosedForAll
                        ? {
                              render: (initial, onNext) => (
                                  <CommissionsPage
                                      initial={initial}
                                      onNext={onNext}
                                      account={account}
                                  />
                              ),
                              title: 'Pool settings',
                          }
                        : undefined,
                metadataUrl:
                    openForDelegation !== OpenStatus.ClosedForAll
                        ? {
                              render: (initial, onNext) => (
                                  <MetadataUrlPage
                                      initial={initial}
                                      onNext={onNext}
                                      account={account}
                                  />
                              ),
                              title: 'Pool settings',
                          }
                        : undefined,
                keys: {
                    render: (initial, onNext) => (
                        <KeysPage
                            account={account}
                            initial={initial}
                            onNext={onNext}
                        />
                    ),
                    title: 'Generated keys',
                },
            })}
        </AccountTransactionFlow>
    );
});
