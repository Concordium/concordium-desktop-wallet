import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PickName from '../AccountCreation/PickName';
import PageLayout from '../../components/PageLayout';
import Form from '../../components/Form';
import SimpleLedger from '../../components/ledger/SimpleLedger';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { createGenesisAccount } from '../../utils/rustInterface';
import { importAccount } from '../../features/AccountSlice';
import { Account, AccountStatus } from '../../utils/types';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import { saveFile } from '~/utils/FileHelper';
import routes from '~/constants/routes.json';
import { toMicroUnits } from '~/utils/gtu';

interface FileInputForm {
    file: FileInputValue;
}

function inputFile(saveFileContent: (file: string) => void) {
    async function handleSubmit(values: FileInputForm) {
        if (values !== null) {
            const { file } = values;
            if (file) {
                const content = Buffer.from(
                    await file[0].arrayBuffer()
                ).toString();
                saveFileContent(content);
            }
        }
    }

    return (
        <Form<FileInputForm> onSubmit={handleSubmit}>
            <Form.File
                name="file"
                placeholder="Drag and drop file here"
                buttonTitle="or browse to file"
                rules={{
                    required: 'File is required',
                }}
            />
            <Form.Submit>Submit</Form.Submit>
        </Form>
    );
}

enum Locations {
    Name,
    Ip,
    Ar,
    Global,
    Create,
}

// The entrance into the flow is the last Route (which should have no path), otherwise the flow is controlled by the components themselves
export default function GenesisAccount(): JSX.Element {
    const dispatch = useDispatch();
    const [currentLocation, setLocation] = useState<Locations>(Locations.Name);
    const [accountName, setAccountName] = useState('');
    const [ipInfo, setIpInfo] = useState<string | undefined>();
    const [arInfo, setArInfo] = useState<string | undefined>();
    const [global, setGlobal] = useState<string | undefined>();
    const [balance] = useState<string>('100');

    // get Identity
    useEffect(() => {}, []);

    async function createAccount(
        ledger: ConcordiumLedgerClient,
        displayMessage: (message: string) => void
    ) {
        if (!ipInfo || !arInfo || !global) {
            throw new Error('missing info');
        }
        const accountDetails = await createGenesisAccount(
            ledger,
            0,
            0,
            JSON.parse(ipInfo),
            JSON.parse(arInfo),
            JSON.parse(global),
            displayMessage
        );

        const success = await saveFile(
            JSON.stringify({
                ...accountDetails,
                balance: toMicroUnits(balance),
            }),
            'Save account details'
        );
        if (success) {
            const account: Account = {
                status: AccountStatus.Confirmed,
                address: accountDetails.address,
                name: accountName,
                identityId: 0,
                maxTransactionId: 0,
                isInitial: false,
            };

            importAccount(account);
            // import credential
            dispatch(push(routes.ACCOUNTS));
        }
    }

    function Create() {
        return <SimpleLedger ledgerCall={createAccount} />;
    }

    const subtitle = () => {
        switch (currentLocation) {
            case Locations.Name:
                return 'Pick Name';
            case Locations.Ip:
                return 'Input IpInfo';
            case Locations.Ar:
                return 'Input ArInfo';
            case Locations.Global:
                return 'Input globalContext';
            case Locations.Create:
                return 'Export keys from ledger';
            default:
                throw new Error('unknown location');
        }
    };

    function Current() {
        switch (currentLocation) {
            case Locations.Name:
                return (
                    <PickName
                        submitName={(name: string) => {
                            setAccountName(name);
                            setLocation(Locations.Ip);
                        }}
                    />
                );
            case Locations.Ip:
                return inputFile((file: string) => {
                    setIpInfo(file);
                    setLocation(Locations.Ar);
                });
            case Locations.Ar:
                return inputFile((file: string) => {
                    setArInfo(file);
                    setLocation(Locations.Global);
                });
            case Locations.Global:
                return inputFile((file: string) => {
                    setGlobal(file);
                    setLocation(Locations.Create);
                });
            case Locations.Create:
                return <Create />;
            default:
                throw new Error('unknown location');
        }
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1> New Account | Genesis Account </h1>
            </PageLayout.Header>
            <PageLayout.Container>
                <h2>{subtitle()}</h2>
                <Current />
            </PageLayout.Container>
        </PageLayout>
    );
}
