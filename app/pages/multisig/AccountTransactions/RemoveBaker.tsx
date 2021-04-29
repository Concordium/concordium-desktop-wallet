import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router';
import { push } from 'connected-react-router';
import MultiSignatureLayout from '../MultiSignatureLayout/MultiSignatureLayout';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import {
    Identity,
    Account,
    TransactionKindId,
    RemoveBaker,
} from '~/utils/types';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from './PickAccount';
import styles from './MultisignatureAccountTransactions.module.scss';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import SignTransaction from './SignTransaction';
import { createRemoveBakerTransaction } from '~/utils/transactionHelpers';
import { credentialsSelector } from '~/features/CredentialSlice';
import { selectedProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';
import { useTransactionCost } from '~/utils/hooks';

const pageTitle = 'Multi Signature Transactions | Remove Baker';

export default function RemoveBakerPage() {
    const { path, url } = useRouteMatch();
    const dispatch = useDispatch();

    return (
        <Switch>
            <Route exact path={`${path}`}>
                <TheProcessDescriptionStep
                    onContinue={() => dispatch(push(`${url}/proposal`))}
                />
            </Route>
            <Route path={`${path}/proposal`}>
                <BuildRemoveBakerTransactionProposalStep
                    onNewProposal={(id) => {
                        dispatch(push(selectedProposalRoute(id)));
                    }}
                />
            </Route>
        </Switch>
    );
}

type TheProcessDescriptionStepProps = {
    onContinue: () => void;
};

function TheProcessDescriptionStep({
    onContinue,
}: TheProcessDescriptionStepProps) {
    return (
        <MultiSignatureLayout pageTitle={pageTitle} stepTitle="The process">
            <div className={styles.descriptionStep}>
                <div style={{ flex: 1 }}>
                    <p>
                        Maybe write out the process here, and something about
                        what happens when a baker is removed.
                    </p>
                </div>
                <Button onClick={onContinue}>Continue</Button>
            </div>
        </MultiSignatureLayout>
    );
}

const placeholderText = 'To be determined';

type BuildTransactionProposalStepProps = {
    onNewProposal: (proposalId: number) => void;
};

function BuildRemoveBakerTransactionProposalStep({
    onNewProposal,
}: BuildTransactionProposalStepProps) {
    const dispatch = useDispatch();
    const { path, url } = useRouteMatch();
    const [identity, setIdentity] = useState<Identity>();
    const [account, setAccount] = useState<Account>();
    const [error, setError] = useState<string>();
    const [transaction, setTransaction] = useState<RemoveBaker>();

    const estimatedFee = useTransactionCost(TransactionKindId.Remove_baker);

    const onCreateTransaction = () => {
        if (account === undefined) {
            setError('Account is needed to make transaction');
            return;
        }

        createRemoveBakerTransaction(account.address)
            .then(setTransaction)
            .catch(() => setError('Failed create transaction'));
    };

    const credentials = useSelector(credentialsSelector);
    const credential = useMemo(
        () =>
            account !== undefined
                ? credentials.find(
                      (cred) => cred.accountAddress === account.address
                  )
                : undefined,
        [credentials, account]
    );

    return (
        <MultiSignatureLayout
            pageTitle={pageTitle}
            stepTitle="Transaction Proposal - Remove Baker"
        >
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to perform transfer"
                content={error}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <Columns divider columnScroll>
                <Columns.Column header="Transaction Details">
                    <div className={styles.details}>
                        <b>Identity:</b>
                        <h2>{identity ? identity.name : placeholderText}</h2>
                        <b>Account:</b>
                        <h2>{account ? account.name : placeholderText}</h2>
                        <DisplayEstimatedFee estimatedFee={estimatedFee} />
                    </div>
                </Columns.Column>
                <Switch>
                    <Route exact path={path}>
                        <Columns.Column header="Identities">
                            <div className={styles.descriptionStep}>
                                <div style={{ flex: 1, alignSelf: 'normal' }}>
                                    <PickIdentity
                                        setReady={() => {}}
                                        setIdentity={setIdentity}
                                        chosenIdentity={identity}
                                    />
                                </div>
                                <Button
                                    disabled={identity === undefined}
                                    onClick={() =>
                                        dispatch(push(`${url}/accounts`))
                                    }
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/accounts`}>
                        <Columns.Column header="Accounts">
                            <div className={styles.descriptionStep}>
                                <div style={{ flex: 1 }}>
                                    <PickAccount
                                        setReady={() => {}}
                                        identity={identity}
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        filter={(_, info) =>
                                            info?.accountBaker !== undefined
                                        }
                                    />
                                </div>
                                <Button
                                    disabled={account === undefined}
                                    onClick={() => {
                                        onCreateTransaction();
                                        dispatch(push(`${url}/sign`));
                                    }}
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/sign`}>
                        <Columns.Column header="Signature and Hardware Wallet">
                            {transaction !== undefined &&
                            account !== undefined &&
                            credential !== undefined ? (
                                <SignTransaction
                                    setReady={() => {}}
                                    account={account}
                                    primaryCredential={credential}
                                    transaction={transaction}
                                    setProposalId={onNewProposal}
                                />
                            ) : null}
                        </Columns.Column>
                    </Route>
                </Switch>
            </Columns>
        </MultiSignatureLayout>
    );
}
