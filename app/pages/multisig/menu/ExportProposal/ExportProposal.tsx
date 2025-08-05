/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { BaseSyntheticEvent } from 'react';
import Card from '~/cross-app-components/Card';
import Form from '~/components/Form';
import styles from './ExportProposal.module.scss';

interface FormData {
    tokenId: string;
    tokenSymbol: string;
    tokenModuleHash: string;
    governanceAccount: string;
    decimals: number;
    name: string;
    metadataUrl: string;
    allowlist: boolean;
    denylist: boolean;
    mintable: boolean;
    burnable: boolean;
    initialSupply: number;
}

export default function ExportProposal() {
    function handleSubmit(
        data: FormData,
        // eslint-disable-next-line @typescript-eslint/ban-types
        event?: BaseSyntheticEvent<object, any, any>
    ) {
        event?.preventDefault();

        const proposalJson = {
            seqNumber: 19,
            effectiveTime: 0,
            timeout: 1944984508,
            payload: {
                updateType: 'createPLT',
                update: {
                    tokenSymbol: data.tokenId,
                    tokenModule: data.tokenModuleHash,
                    governanceAccount: data.governanceAccount,
                    // eslint-disable-next-line radix
                    decimals: parseInt(String(data.decimals)),
                    initializationParameters: {
                        name: data.name,
                        metadata: data.metadataUrl,
                        initialSupply: parseFloat(String(data.initialSupply)),
                        allowList: data.allowlist,
                        denyList: data.denylist,
                        mintable: data.mintable,
                        burnable: data.burnable,
                    },
                },
            },
        };

        // Create and download the JSON file
        const blob = new Blob([JSON.stringify(proposalJson, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `plt-proposal-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    return (
        <Card className="pH40 pV30 relative textCenter">
            <h3 className="{styles.top}">
                Create Protocol Level Token Proposal
            </h3>

            <Form onSubmit={handleSubmit}>
                <Form.Input
                    className={styles.input}
                    name="tokenId"
                    label="Token ID"
                    rules={{ required: 'Token ID is required' }}
                    maxLength={128}
                    pattern="^[a-zA-Z0-9.%-]{1,128}$"
                    placeholder="Alphanumeric and . % - (max 128 chars)"
                    onChange={(event) => {
                        event.target.value = event.target.value
                            .replace(/[^a-zA-Z0-9.%-]/g, '')
                            .slice(0, 128);
                    }}
                    onBlur={(event) => {
                        if (
                            !/^[a-zA-Z0-9.%-]{1,128}$/.test(event.target.value)
                        ) {
                            event.target.value = event.target.value
                                .replace(/[^a-zA-Z0-9.%-]/g, '')
                                .slice(0, 128);
                        }
                    }}
                />
                <Form.Input
                    className={styles.input}
                    name="tokenModuleHash"
                    label="Token Module Hash"
                    defaultValue="5c5c2645db84a7026d78f2501740f60a8ccb8fae5c166dc2428077fd9a699a4a"
                    disabled
                />
                <Form.Input
                    className={styles.input}
                    name="decimals"
                    label="Decimals"
                    rules={{ required: 'Decimals is required' }}
                    min={0}
                    max={255}
                    pattern="^([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$"
                    placeholder="Enter a number (0-255)"
                    onChange={(event) => {
                        event.target.value = String(
                            Math.min(
                                255,
                                // eslint-disable-next-line radix
                                Math.max(0, parseInt(event.target.value) || 0)
                            )
                        ).replace(/[^\d]/g, '');
                    }}
                />
                <Form.Input
                    className={styles.input}
                    name="name"
                    label="Name"
                    rules={{ required: 'Name is required' }}
                />
                <Form.Input
                    className={styles.input}
                    name="metadataUrl"
                    label="Metadata URL"
                />
                <Form.Input
                    className={styles.input}
                    name="goverNanceAccount"
                    label="Governance Account"
                    placeholder="Account Address"
                    rules={{ required: 'Account Address is required' }}
                />
                <Form.Checkbox name="allowlist" className={styles.input}>
                    Allowlist
                </Form.Checkbox>
                <Form.Checkbox name="denylist" className={styles.input}>
                    Denylist
                </Form.Checkbox>
                <Form.Checkbox name="mintable" className={styles.input}>
                    Mintable
                </Form.Checkbox>
                <Form.Checkbox name="burnable" className={styles.input}>
                    Burnable
                </Form.Checkbox>
                <Form.Input
                    className={styles.input}
                    name="initialSupply"
                    label="Initial Supply"
                    defaultValue="hash"
                    disabled
                />
                <Form.Submit className={styles.input}>Continue</Form.Submit>
            </Form>
        </Card>
    );
}
