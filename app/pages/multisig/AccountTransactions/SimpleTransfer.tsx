import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import {
    Account,
    Identity,
    TransactionKindString,
    TransactionKindId,
    AddressBookEntry,
    Fraction,
} from '~/utils/types';
import PickAmount from './PickAmount';
import PickRecipient from '~/components/Transfers/PickRecipient';
import Columns from '~/components/Columns';
import routes from '~/constants/routes.json';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from './PickAccount';
import Button from '~/cross-app-components/Button';
import TransactionProposalDetails from './TransactionProposalDetails';
import { isValidGTUString } from '~/utils/gtu';
import CreateTransaction from './CreateTransaction';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import MultiSignatureLayout from '~/pages/multisig/MultiSignatureLayout';
import { getTransactionKindCost } from '~/utils/transactionCosts';
import SimpleErrorModal from '~/components/SimpleErrorModal';

function subTitle(currentLocation: string) {
    switch (currentLocation) {
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
            return 'Select a proposer';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT:
            return 'Select sender account';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT:
            return 'Input amount';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT:
            return 'Select recipient';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION:
            return 'Signature and Hardware Wallet';
        default:
            throw new Error('unknown location');
    }
}

/**
 * This component controls the flow of creating a multisignature simple transfer.
 * It contains the logic for displaying the current parameters.
 */
export default function SimpleTransfer(): JSX.Element {
    const dispatch = useDispatch();
    const { transactionKind: transactionKindString } = useParams<{
        transactionKind: TransactionKindString;
    }>();
    const location = useLocation().pathname.replace(
        transactionKindString,
        ':transactionKind'
    );

    const transactionKind = TransactionKindId.Simple_transfer;
    const handler = findAccountTransactionHandler(transactionKind);

    const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account>();
    const [identity, setIdentity] = useState<Identity>();
    const [amount, setAmount] = useState<string>(''); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry>();
    const [proposalId, setProposalId] = useState<number>(-1);
    const [estimatedFee, setFee] = useState<Fraction>();
    const [error, setError] = useState<string>();

    useEffect(() => {
        if (account) {
            getTransactionKindCost(
                TransactionKindId.Simple_transfer,
                account.signatureThreshold
            )
                .then((fee) => setFee(fee))
                .catch(() => setError('Unable to reach Node.'));
        }
    }, [account, setFee]);

    function updateAmount(newAmount: string) {
        if (isValidGTUString(newAmount)) {
            setReady(true);
        }
        setAmount(newAmount);
    }

    function renderSignTransaction() {
        if (!account || !recipient) {
            throw new Error('Unexpected missing account or recipient');
        }
        return (
            <CreateTransaction
                setReady={setReady}
                recipient={recipient}
                amount={amount}
                account={account}
                estimatedFee={estimatedFee}
                setProposalId={setProposalId}
            />
        );
    }

    return (
        <MultiSignatureLayout
            pageTitle={handler.title}
            stepTitle="Transaction Proposal - Send GTU"
        >
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to perform transfer"
                content={error}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <Columns divider columnScroll>
                <Columns.Column header="Transaction Details">
                    <TransactionProposalDetails
                        account={account}
                        identity={identity}
                        amount={amount}
                        recipient={recipient}
                        estimatedFee={estimatedFee}
                    />
                    <Button
                        disabled={!isReady}
                        onClick={() => {
                            setReady(false);
                            dispatch(
                                push({
                                    pathname: handler.creationLocationHandler(
                                        location,
                                        proposalId
                                    ),
                                    state: TransactionKindString.Transfer,
                                })
                            );
                        }}
                    >
                        Continue
                    </Button>
                </Columns.Column>
                <Columns.Column header={subTitle(location)}>
                    <Switch>
                        <Route
                            path={
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT
                            }
                            render={() => (
                                <PickAccount
                                    setReady={setReady}
                                    setAccount={setAccount}
                                    identity={identity}
                                />
                            )}
                        />
                        <Route
                            path={
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION
                            }
                            render={renderSignTransaction}
                        />
                        <Route
                            path={
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT
                            }
                            render={() => (
                                <PickAmount
                                    setReady={setReady}
                                    account={account}
                                    amount={amount}
                                    setAmount={updateAmount}
                                    estimatedFee={estimatedFee}
                                />
                            )}
                        />
                        <Route
                            path={
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT
                            }
                            render={() => (
                                <PickRecipient
                                    pickRecipient={(newRecipient) => {
                                        setReady(true);
                                        setRecipient(newRecipient);
                                    }}
                                />
                            )}
                        />
                        <Route
                            path={
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION
                            }
                            render={() => (
                                <PickIdentity
                                    setReady={setReady}
                                    setIdentity={setIdentity}
                                />
                            )}
                        />
                    </Switch>
                </Columns.Column>
            </Columns>
        </MultiSignatureLayout>
    );
}
