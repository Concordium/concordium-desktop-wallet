import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PlusIcon from '@resources/svg/plus.svg';
import PickRecipient from '../PickRecipient';
import PickAmount from '../PickAmount';
import FinalPage from '../FinalPage';
import { TransactionKindId, AddressBookEntry, Fraction } from '~/utils/types';
import locations from '~/constants/transferLocations.json';
import { TransferState } from '~/utils/transactionTypes';
import TransferView from '../TransferView';
import UpsertAddress from '../../UpsertAddress';

import styles from './ExternalTransfer.module.scss';

interface Props {
    toConfirmTransfer(
        amount: string,
        recipient: AddressBookEntry,
        memo?: string
    ): void;
    exitFunction(): void;
    estimatedFee?: Fraction;
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
    estimatedFee,
    exitFunction,
    senderAddress,
    transactionKind,
}: Props) {
    const location = useLocation<TransferState>();

    const [subLocation, setSubLocation] = useState<string>(
        location?.state?.initialPage || locations.pickAmount
    );

    const [amount, setAmount] = useState<string>(
        location?.state?.amount ?? '0.00'
    ); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>(
        location?.state?.recipient
    );

    function selectRecipient(entry: AddressBookEntry) {
        setRecipient(entry);
        setSubLocation(locations.pickAmount);
    }

    return (
        <TransferView
            showBack={
                subLocation === locations.pickRecipient ||
                subLocation === locations.confirmTransfer
            }
            exitOnClick={exitFunction}
            backOnClick={() => setSubLocation(locations.pickAmount)}
        >
            {subLocation === locations.pickAmount && (
                <PickAmount
                    withMemo
                    recipient={recipient}
                    header={amountHeader}
                    defaultAmount={amount}
                    estimatedFee={estimatedFee}
                    transactionKind={transactionKind}
                    toPickRecipient={(currentAmount: string) => {
                        setAmount(currentAmount);
                        setSubLocation(locations.pickRecipient);
                    }}
                    toConfirmTransfer={(
                        currentAmount: string,
                        memo?: string
                    ) => {
                        if (!recipient) {
                            throw new Error('Unexpected missing recipient');
                        }
                        toConfirmTransfer(currentAmount, recipient, memo);
                    }}
                />
            )}
            {subLocation === locations.pickRecipient && (
                <>
                    <div className="mH30">
                        <h3 className="textCenter">Select recipient</h3>
                        <PickRecipient
                            pickRecipient={selectRecipient}
                            senderAddress={senderAddress}
                        />
                    </div>
                    <UpsertAddress
                        clear
                        className={styles.addRecipient}
                        onSubmit={selectRecipient}
                    >
                        <PlusIcon />
                    </UpsertAddress>
                </>
            )}
            {subLocation === locations.transferSubmitted && (
                <FinalPage location={location} />
            )}
        </TransferView>
    );
}
