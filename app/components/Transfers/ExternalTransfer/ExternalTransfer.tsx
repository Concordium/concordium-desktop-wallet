import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import PlusIcon from '@resources/svg/plus.svg';
import PickRecipient from '../PickRecipient';
import PickAmount from '../PickAmount';
import { getTransactionKindCost } from '~/utils/transactionCosts';
import { TransactionKindId, AddressBookEntry, Fraction } from '~/utils/types';
import locations from '~/constants/transferLocations.json';
import { TransferState } from '~/utils/transactionTypes';
import TransferView from '../TransferView';
import UpsertAddress from '../../UpsertAddress';
import { useAsyncMemo } from '~/utils/hooks';
import { nodeSupportsMemo } from '~/node/nodeHelpers';

import styles from './ExternalTransfer.module.scss';

interface Props {
    toConfirmTransfer(
        amount: string,
        recipient: AddressBookEntry,
        memo?: string
    ): void;
    exitFunction?(): void;
    exchangeRate?: Fraction;
    amountHeader: string;
    senderAddress: string;
    transactionKind: TransactionKindId;
}

/**
 * Controls the flow of creating an external transfer.
 */
export default function ExternalTransfer({
    toConfirmTransfer,
    amountHeader,
    exchangeRate,
    exitFunction,
    senderAddress,
    transactionKind,
}: Props) {
    const location = useLocation<TransferState>();

    const allowMemo = useAsyncMemo(nodeSupportsMemo);

    const [subLocation, setSubLocation] = useState<string>(
        locations.pickAmount
    );

    const [amount, setAmount] = useState<string>(
        location?.state?.amount ?? '0.00'
    ); // This is a string, to allows user input in CCD
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>(
        location?.state?.recipient
    );

    const [memo, setMemo] = useState<string | undefined>(location?.state?.memo);
    const [shownMemoWarning, setShownMemoWarning] = useState<boolean>(
        !!location?.state?.memo
    );

    const estimatedFee = useMemo(
        () =>
            exchangeRate &&
            getTransactionKindCost(transactionKind, exchangeRate, 1, memo),
        [exchangeRate, memo, transactionKind]
    );

    function selectRecipient(entry: AddressBookEntry) {
        setRecipient(entry);
        setSubLocation(locations.pickAmount);
    }

    return (
        <TransferView
            showBack={subLocation === locations.pickRecipient}
            exitOnClick={exitFunction}
            backOnClick={() => setSubLocation(locations.pickAmount)}
        >
            {subLocation === locations.pickAmount && (
                <PickAmount
                    recipient={recipient}
                    header={amountHeader}
                    defaultAmount={amount}
                    memo={
                        allowMemo
                            ? {
                                  defaultMemo: memo,
                                  setMemo,
                                  shownMemoWarning,
                                  setShownMemoWarning,
                              }
                            : undefined
                    }
                    estimatedFee={estimatedFee}
                    transactionKind={transactionKind}
                    toPickRecipient={(
                        currentAmount: string,
                        currentMemo?: string
                    ) => {
                        setMemo(currentMemo);
                        setAmount(currentAmount);
                        setSubLocation(locations.pickRecipient);
                    }}
                    toConfirmTransfer={(
                        currentAmount: string,
                        currentMemo?: string
                    ) => {
                        if (!recipient) {
                            throw new Error('Unexpected missing recipient');
                        }
                        toConfirmTransfer(
                            currentAmount,
                            recipient,
                            currentMemo
                        );
                    }}
                />
            )}
            {subLocation === locations.pickRecipient && (
                <>
                    <div className="mH30">
                        <h3 className="textCenter bodyEmphasized">
                            Select recipient
                        </h3>
                        <PickRecipient
                            pickRecipient={selectRecipient}
                            senderAddress={senderAddress}
                        />
                    </div>
                    <UpsertAddress
                        className={styles.addRecipient}
                        onSubmit={selectRecipient}
                        allowAlias={false}
                    >
                        <PlusIcon />
                    </UpsertAddress>
                </>
            )}
        </TransferView>
    );
}
