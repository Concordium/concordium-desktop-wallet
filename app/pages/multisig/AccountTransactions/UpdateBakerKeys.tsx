import React, { ReactNode, useMemo, useState } from 'react';
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
    UpdateBakerKeysPayload,
    UpdateBakerKeys,
} from '~/utils/types';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from './PickAccount';
import styles from './MultisignatureAccountTransactions.module.scss';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { BakerKeys, generateBakerKeys } from '~/utils/rustInterface';
import { chunk } from '../util';
import SignTransaction from './SignTransaction';
import { createUpdateBakerKeysTransaction } from '~/utils/transactionHelpers';
import { credentialsSelector } from '~/features/CredentialSlice';
import { selectedProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';
import { saveFile } from '~/utils/FileHelper';
import { useAccountInfo, useTransactionCost } from '~/utils/hooks';

const pageTitle = 'Multi Signature Transactions | Update Baker Keys';

export default function AddBakerPage() {
    const { path, url } = useRouteMatch();
    const dispatch = useDispatch();
    const [proposalId, setProposalId] = useState<number>();
    const [bakerKeys, setBakerKeys] = useState<BakerKeys>();
    const [senderAddress, setSenderAddress] = useState<string>();

    return (
        <Switch>
            <Route exact path={path}>
                <TheProcessDescriptionStep
                    onContinue={() => dispatch(push(`${url}/proposal`))}
                />
            </Route>
            <Route path={`${path}/proposal`}>
                <BuildAddBakerTransactionProposalStep
                    onNewProposal={(id, keys, address) => {
                        setProposalId(id);
                        setBakerKeys(keys);
                        setSenderAddress(address);
                        dispatch(push(`${url}/download-keys`));
                    }}
                />
            </Route>
            <Route path={`${path}/download-keys`}>
                {bakerKeys !== undefined &&
                proposalId !== undefined &&
                senderAddress !== undefined ? (
                    <DownloadBakerCredentialsStep
                        bakerKeys={bakerKeys}
                        accountAddress={senderAddress}
                        onContinue={() => {
                            dispatch(push(selectedProposalRoute(proposalId)));
                        }}
                    />
                ) : null}
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
                    <p>Maybe write out the process here?</p>
                    <p>
                        Maybe mention that the flow ends with a json file, which
                        the baking node needs to be started with?
                    </p>
                </div>
                <Button onClick={onContinue}>Continue</Button>
            </div>
        </MultiSignatureLayout>
    );
}

const placeholderText = 'To be determined';

type BuildTransactionProposalStepProps = {
    onNewProposal: (
        proposalId: number,
        keys: BakerKeys,
        accountAddress: string
    ) => void;
};

function BuildAddBakerTransactionProposalStep({
    onNewProposal,
}: BuildTransactionProposalStepProps) {
    const dispatch = useDispatch();
    const { path, url } = useRouteMatch();
    const [identity, setIdentity] = useState<Identity>();
    const [account, setAccount] = useState<Account>();
    const [error, setError] = useState<string>();
    const [bakerKeys, setBakerKeys] = useState<BakerKeys>();
    const [transaction, setTransaction] = useState<UpdateBakerKeys>();

    const estimatedFee = useTransactionCost(TransactionKindId.Remove_baker);

    const onGenerateKeys = () => {
        if (account === undefined) {
            setError('An account is needed to generate baker keys');
            return;
        }
        generateBakerKeys(account.address, 'UPDATE')
            .then((keys) => setBakerKeys(keys))
            .catch(() => setError('Failed generating baker keys'));
    };

    const onCreateTransaction = () => {
        if (bakerKeys === undefined) {
            setError('Baker keys are needed to make transaction');
            return;
        }
        if (account === undefined) {
            setError('Account is needed to make transaction');
            return;
        }

        const payload: UpdateBakerKeysPayload = {
            electionVerifyKey: bakerKeys.electionPublic,
            signatureVerifyKey: bakerKeys.signaturePublic,
            aggregationVerifyKey: bakerKeys.aggregationPublic,
            proofElection: bakerKeys.proofElection,
            proofSignature: bakerKeys.proofSignature,
            proofAggregation: bakerKeys.proofAggregation,
        };
        createUpdateBakerKeysTransaction(account.address, payload)
            .then(setTransaction)
            .catch((e: Error) =>
                setError(`Failed create transaction: ${e.message}`)
            );
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
            stepTitle="Transaction Proposal - Update Baker Keys"
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
                        <b>Public keys</b>
                        {bakerKeys === undefined ? (
                            'To be generated'
                        ) : (
                            <>
                                <PublicKey>
                                    {chunk(bakerKeys.electionPublic, 32).join(
                                        '\n'
                                    )}
                                </PublicKey>
                                <PublicKey>
                                    {chunk(bakerKeys.signaturePublic, 32).join(
                                        '\n'
                                    )}
                                </PublicKey>
                                <PublicKey>
                                    {chunk(
                                        bakerKeys.aggregationPublic,
                                        32
                                    ).join('\n')}
                                </PublicKey>
                            </>
                        )}
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
                                        onGenerateKeys();
                                        dispatch(push(`${url}/keys`));
                                    }}
                                >
                                    Generate keys
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/keys`}>
                        <Columns.Column header="Baker keys">
                            <div className={styles.descriptionStep}>
                                <div style={{ flex: 1 }}>
                                    {bakerKeys === undefined ? (
                                        <p>Generating keys...</p>
                                    ) : (
                                        <p>
                                            Your baker keys have been generated,
                                            and the public keys can be seen to
                                            the left.
                                        </p>
                                    )}
                                </div>
                                <Button
                                    disabled={bakerKeys === undefined}
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
                            credential !== undefined &&
                            bakerKeys !== undefined ? (
                                <SignTransaction
                                    setReady={() => {}}
                                    account={account}
                                    primaryCredential={credential}
                                    transaction={transaction}
                                    setProposalId={(id) =>
                                        onNewProposal(
                                            id,
                                            bakerKeys,
                                            account.address
                                        )
                                    }
                                />
                            ) : null}
                        </Columns.Column>
                    </Route>
                </Switch>
            </Columns>
        </MultiSignatureLayout>
    );
}

type PublicKeyProps = {
    children: ReactNode;
};

function PublicKey({ children }: PublicKeyProps) {
    return <p style={{ fontFamily: 'monospace' }}>{children}</p>;
}

type DownloadBakerCredentialsStepProps = {
    accountAddress: string;
    bakerKeys: BakerKeys;
    onContinue: () => void;
};

function DownloadBakerCredentialsStep({
    accountAddress,
    bakerKeys,
    onContinue,
}: DownloadBakerCredentialsStepProps) {
    const accountInfo = useAccountInfo(accountAddress);

    const onExport = async () => {
        if (accountInfo === undefined) {
            return;
        }
        const fileString = JSON.stringify({
            bakerId: accountInfo.accountIndex,
            aggregationSignKey: bakerKeys.aggregationSecret,
            aggregationVerifyKey: bakerKeys.aggregationPublic,
            electionPrivateKey: bakerKeys.electionSecret,
            electionVerifyKey: bakerKeys.electionPublic,
            signatureSignKey: bakerKeys.signatureSecret,
            signatureVerifyKey: bakerKeys.signaturePublic,
        });
        const success = await saveFile(fileString, {
            title: 'Save Baker Credentials',
            defaultPath: 'baker-credentials.json',
        });
        if (success) {
            onContinue();
        }
    };

    return (
        <MultiSignatureLayout
            pageTitle={pageTitle}
            stepTitle="Baker Credentials"
        >
            <div className={styles.descriptionStep}>
                <div style={{ flex: 1 }}>
                    <p>
                        Make sure to export and backup your Baker Credentials,
                        as you will have to generate a new if lost.
                    </p>
                    <p>
                        {' '}
                        ... Warning, this will be the only chance to export the
                        baker credentials or the user will have to generate new
                        ones ...
                    </p>
                    <p>... Warning about sharing the credentials ...</p>
                </div>
                <Button onClick={onExport}>Export Baker Credentials</Button>
            </div>
        </MultiSignatureLayout>
    );
}
