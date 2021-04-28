import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router';
import { push } from 'connected-react-router';
import Form from '~/components/Form';
import MultiSignatureLayout from '../MultiSignatureLayout/MultiSignatureLayout';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import SwitchToggle from '~/cross-app-components/Switch';
import {
    Identity,
    Account,
    Fraction,
    TransactionKindId,
    AccountTransaction,
    AddBakerPayload,
} from '~/utils/types';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from './PickAccount';
import styles from './MultisignatureAccountTransactions.module.scss';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { getGTUSymbol } from '~/utils/gtu';
import PickAmount from './PickAmount';
import { getTransactionKindCost } from '~/utils/transactionCosts';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { BakerKeys, generateBakerKeys } from '~/utils/rustInterface';
import { chunk } from '../util';
import SignTransaction from './SignTransaction';
import { createAddBakerTransaction } from '~/utils/transactionHelpers';
import { credentialsSelector } from '~/features/CredentialSlice';
import { selectedProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';
import { saveFile } from '~/utils/FileHelper';

export default function AddBakerPage() {
    const { path, url } = useRouteMatch();
    const dispatch = useDispatch();
    const [proposalId, setProposalId] = useState<number>();
    const [bakerKeys, setBakerKeys] = useState<BakerKeys>();

    return (
        <Switch>
            <Route exact path={path}>
                <BeforeYouStartStep
                    onContinue={() => dispatch(push(`${url}/process`))}
                />
            </Route>
            <Route path={`${path}/process`}>
                <TheProcessDescriptionStep
                    onContinue={() => dispatch(push(`${url}/proposal`))}
                />
            </Route>
            <Route path={`${path}/proposal`}>
                <BuildAddBakerTransactionProposalStep
                    onNewProposal={(id, keys) => {
                        setProposalId(id);
                        setBakerKeys(keys);
                        dispatch(push(`${url}/download-keys`));
                    }}
                />
            </Route>
            <Route path={`${path}/download-keys`}>
                {bakerKeys !== undefined && proposalId !== undefined ? (
                    <DownloadBakerCredentialsStep
                        bakerKeys={bakerKeys}
                        bakerId={0 /* TODO get baker id */}
                        onContinue={() => {
                            dispatch(push(selectedProposalRoute(proposalId)));
                        }}
                    />
                ) : null}
            </Route>
        </Switch>
    );
}

type BeforeYouStartStepProps = {
    onContinue: () => void;
};

function BeforeYouStartStep({ onContinue }: BeforeYouStartStepProps) {
    type FormValues = { implications: boolean };

    return (
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Add Baker"
            stepTitle="Before you start"
        >
            <Form<FormValues> onSubmit={onContinue}>
                Maybe insert some explanation of what it means to become a
                baker, and what it is needed to do so. <br />
                <br />
                Maybe something about stake as well. Maybe mention that the flow
                will end with a json file, that the user needs to start the
                baking node with.
                <Form.Checkbox
                    name="implications"
                    rules={{
                        required:
                            'It is important that you understand the implications',
                    }}
                >
                    I understand the implications of adding a baker
                </Form.Checkbox>
                <Form.Submit>Continue</Form.Submit>
            </Form>
        </MultiSignatureLayout>
    );
}

type TheProcessDescriptionStepProps = {
    onContinue: () => void;
};

function TheProcessDescriptionStep({
    onContinue,
}: TheProcessDescriptionStepProps) {
    return (
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Add Baker"
            stepTitle="The process"
        >
            Maybe write out the process here?
            <Button onClick={onContinue}>Continue</Button>
        </MultiSignatureLayout>
    );
}

const placeholderText = 'To be determined';

type BuildTransactionProposalStepProps = {
    onNewProposal: (proposalId: number, keys: BakerKeys) => void;
};

function BuildAddBakerTransactionProposalStep({
    onNewProposal,
}: BuildTransactionProposalStepProps) {
    const dispatch = useDispatch();
    const { path, url } = useRouteMatch();
    const [identity, setIdentity] = useState<Identity>();
    const [account, setAccount] = useState<Account>();
    const [stake, setStake] = useState<string>('0');
    const [estimatedFee, setFee] = useState<Fraction>();
    const [restakeEnabled, setRestakeEnabled] = useState<boolean>(false);
    const [error, setError] = useState<string>();
    const [bakerKeys, setBakerKeys] = useState<BakerKeys>();
    const [transaction, setTransaction] = useState<
        AccountTransaction<AddBakerPayload>
    >();

    useEffect(() => {
        getTransactionKindCost(TransactionKindId.Add_baker)
            .then((fee) => setFee(fee))
            .catch(() => setError('Unable to reach Node.'));
    }, []);
    const onGenerateKeys = () => {
        if (account === undefined) {
            setError('An account is needed to generate baker keys');
            return;
        }
        generateBakerKeys(account.address)
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

        const payload: AddBakerPayload = {
            electionVerifyKey: bakerKeys.electionPublic,
            signatureVerifyKey: bakerKeys.signaturePublic,
            aggregationVerifyKey: bakerKeys.aggregationPublic,
            proofElection: bakerKeys.proofElection,
            proofSignature: bakerKeys.proofSignature,
            proofAggregation: bakerKeys.proofAggregation,
            bakingStake: stake,
            restakeEarnings: restakeEnabled,
        };
        createAddBakerTransaction(account.address, payload)
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

    const formatRestakeEnabled = restakeEnabled ? 'Yes' : 'No';

    return (
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Add Baker"
            stepTitle="Transaction Proposal - Add Baker"
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
                        <b>Amount to stake:</b>
                        <h2>
                            {stake
                                ? `${getGTUSymbol()} ${stake}`
                                : placeholderText}
                        </h2>
                        <DisplayEstimatedFee estimatedFee={estimatedFee} />
                        <b>Restake earnings</b>
                        <h2>
                            {restakeEnabled === undefined
                                ? placeholderText
                                : formatRestakeEnabled}
                        </h2>
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
                            <PickIdentity
                                setReady={() => {}}
                                setIdentity={setIdentity}
                                chosenIdentity={identity}
                            />
                            <Button
                                disabled={identity === undefined}
                                onClick={() =>
                                    dispatch(push(`${url}/accounts`))
                                }
                            >
                                Continue
                            </Button>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/accounts`}>
                        <Columns.Column header="Accounts">
                            <PickAccount
                                setReady={() => {}}
                                identity={identity}
                                setAccount={setAccount}
                                chosenAccount={account}
                            />
                            <Button
                                disabled={account === undefined}
                                onClick={() => dispatch(push(`${url}/stake`))}
                            >
                                Continue
                            </Button>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/stake`}>
                        <Columns.Column header="Stake">
                            <PickAmount
                                setReady={() => {}}
                                amount={stake}
                                account={account}
                                estimatedFee={estimatedFee}
                                setAmount={setStake}
                            />
                            <SwitchToggle
                                checked={restakeEnabled}
                                onChange={(event) =>
                                    setRestakeEnabled(event.target.checked)
                                }
                            >
                                Enable restaking
                            </SwitchToggle>
                            <Button
                                onClick={() => {
                                    onGenerateKeys();
                                    dispatch(push(`${url}/keys`));
                                }}
                            >
                                Generate keys
                            </Button>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/keys`}>
                        <Columns.Column header="Baker keys">
                            {bakerKeys === undefined ? (
                                <p>Generating keys...</p>
                            ) : (
                                <p>
                                    Your baker keys have been generated, and the
                                    public keys can be seen to the left.
                                </p>
                            )}
                            <Button
                                disabled={bakerKeys === undefined}
                                onClick={() => {
                                    onCreateTransaction();
                                    dispatch(push(`${url}/sign`));
                                }}
                            >
                                Continue
                            </Button>
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
                                        onNewProposal(id, bakerKeys)
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
    bakerKeys: BakerKeys;
    bakerId: number;
    onContinue: () => void;
};

function DownloadBakerCredentialsStep({
    bakerKeys,
    bakerId,
    onContinue,
}: DownloadBakerCredentialsStepProps) {
    const onExport = async () => {
        const fileString = JSON.stringify({
            bakerId,
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
            pageTitle="Multi Signature Transactions | Add Baker"
            stepTitle="Baker Credentials"
        >
            <Button onClick={onExport}>Export Baker Credentials</Button>
        </MultiSignatureLayout>
    );
}
