import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { TokenHolder, TokenAmount, TokenId } from '@concordium/web-sdk/plt';
import { AccountAddress } from '@concordium/web-sdk';

import { EqualRecord } from '~/utils/types';
import Form from '~/components/Form/';
import { mustBeAnInteger, requiredMessage } from '../common/util';
import { getAccountInfoOfAddress } from '~/node/nodeHelpers';
import { getTokenInfo } from '~/node/nodeRequests';

export interface UpdateCreatePltParametersFields {
    tokenId: string;
    name: string;
    moduleRef: string;
    metadataUrl: string;
    metadataHash?: string;
    governanceAccount: string;
    decimals: number;
    initialSupply?: bigint;
    allowList?: boolean;
    denyList?: boolean;
    mintable?: boolean;
    burnable?: boolean;
}

const fieldNames: EqualRecord<Required<UpdateCreatePltParametersFields>> = {
    tokenId: 'tokenId',
    name: 'name',
    moduleRef: 'moduleRef',
    metadataUrl: 'metadataUrl',
    metadataHash: 'metadataHash',
    governanceAccount: 'governanceAccount',
    decimals: 'decimals',
    initialSupply: 'initialSupply',
    allowList: 'allowList',
    denyList: 'denyList',
    mintable: 'mintable',
    burnable: 'burnable',
};

export const fieldDisplays = {
    tokenId: 'Token ID',
    name: 'Name',
    moduleRef: 'Module Reference',
    metadataUrl: 'Metadata Url',
    metadataHash: 'Metadata Hash',
    governanceAccount: 'Governance Account',
    decimals: 'Decimals',
    initialSupply: 'Initial Supply',
    allowList: 'Allow List',
    denyList: 'Deny List',
    mintable: 'Mintable',
    burnable: 'Burnable',
};

/**
 * Component for creating an update create PLT transaction.
 */
export default function CreatePltParameters(): JSX.Element | null {
    const { watch } = useFormContext();
    const decimals = watch(fieldNames.decimals);

    const [tokenIdWarning, setTokenIdWarning] = useState<string>('');

    return (
        <div>
            <Form.Input
                className="body2 mB20"
                name={fieldNames.tokenId}
                label={`${fieldDisplays.tokenId}`}
                placeholder="Alphanumeric and . % - (max 128 chars)"
                maxLength={128}
                pattern="^[a-zA-Z0-9.%-]{1,128}$"
                rules={{
                    required: requiredMessage(fieldDisplays.tokenId),
                    validate: async (tokenId: string) => {
                        // Check restrictions enforced by the node.
                        if (
                            tokenId !== tokenId.replace(/[^a-zA-Z0-9.%-]/g, '')
                        ) {
                            return "Only letters, numbers, '.', '%', and '-' are allowed.";
                        }
                        if (tokenId.length > 128) {
                            return 'Must be 128 characters or less.';
                        }

                        // Check Concordium's soft guidelines (internal agreement, not strictly enforced by the node).
                        let warning = '';

                        if (tokenId !== tokenId.replace(/[^a-zA-Z0-9]/g, '')) {
                            warning +=
                                '⚠️ Concordium internal guidelines recommend using only alphanumeric characters for tokenIds. ';
                        }
                        if (tokenId.length > 6) {
                            warning +=
                                '⚠️ Concordium internal guidelines recommend tokenIds of at most 6 characters. Wallets may not display longer Ids correctly.';
                        }
                        setTokenIdWarning(warning);

                        // Check that token id does not already exist on-chain.
                        let tokenInfo;
                        try {
                            tokenInfo = await getTokenInfo(
                                TokenId.fromString(tokenId)
                            );
                        } catch (e) {
                            if (e instanceof Error) {
                                if (
                                    (e as Error).message ===
                                    `tokenId or block not found.`
                                ) {
                                    // Treat the given error message as
                                    // that the token doesn't exist on-chain.
                                    // Meaning the validation passes.
                                    return true;
                                }
                                return `Cannot fetch tokenId: ${e.message}`;
                            }
                            return `Cannot fetch tokenId`;
                        }
                        if (tokenInfo) {
                            return 'Token Id already exists on-chain.';
                        }
                        return true;
                    },
                }}
            />
            {tokenIdWarning !== '' && (
                <p style={{ color: 'orange' }}>{tokenIdWarning}</p>
            )}
            <Form.Input
                className="body2 mB20"
                name={fieldNames.name}
                label={`${fieldDisplays.name}`}
                placeholder="Token Name"
                rules={{ required: requiredMessage(fieldDisplays.name) }}
            />
            <Form.Input
                className="body2 mB20"
                name={fieldNames.moduleRef}
                label={`${fieldDisplays.moduleRef}`}
                defaultValue="5c5c2645db84a7026d78f2501740f60a8ccb8fae5c166dc2428077fd9a699a4a"
                rules={{
                    required: requiredMessage(fieldDisplays.moduleRef),
                    validate: (value: string) => {
                        if (
                            value !==
                            '5c5c2645db84a7026d78f2501740f60a8ccb8fae5c166dc2428077fd9a699a4a'
                        ) {
                            return 'Protocol 9 only supports token module hash `5c5c2645db84a7026d78f2501740f60a8ccb8fae5c166dc2428077fd9a699a4a`.';
                        }
                        return true;
                    },
                }}
            />
            <Form.Input
                className="body2 mB20"
                name={fieldNames.metadataUrl}
                label={`${fieldDisplays.metadataUrl}`}
                placeholder="https://tokenWebsite.com"
                rules={{ required: requiredMessage(fieldDisplays.metadataUrl) }}
            />
            <Form.Input
                className="body2 mB20"
                name={fieldNames.metadataHash}
                label={`${fieldDisplays.metadataHash} (Optional)`}
                placeholder="b27a46456f5d3c089f7ad76bbbc3525ef277532b131ffadfc2565094c4b5133a"
                rules={{
                    validate: (hash?: string) => {
                        if (!hash) {
                            // Allow undefined (no checksum hash)
                            return true;
                        }
                        // Check if hash is set that it is a valid hash.
                        if (!/^[a-f0-9]{64}$/.test(hash)) {
                            return 'Hash must be a 64-character hexadecimal string';
                        }
                        return true;
                    },
                }}
            />
            <Form.Input
                className="body2 mB20"
                name={fieldNames.governanceAccount}
                label={`${fieldDisplays.governanceAccount}`}
                placeholder="4BTFaHx8CioLi8Xe7YiimpAK1oQMkbx5Wj6B8N7d7NXgmLvEZs"
                rules={{
                    required: requiredMessage(fieldDisplays.governanceAccount),
                    validate: async (governanceAccount: string) => {
                        try {
                            TokenHolder.fromAccountAddress(
                                AccountAddress.fromBase58(governanceAccount)
                            );
                            // Check if account exists on-chain.
                            await getAccountInfoOfAddress(governanceAccount);
                            return true;
                        } catch (e) {
                            if (e instanceof Error) {
                                return `Governance account does not exist on-chain. Couldn't fetch governance account info from the connected chain: ${e.message}`;
                            }
                            return `Governance account does not exist on-chain. Couldn't fetch governance account info from the connected chain.`;
                        }
                    },
                }}
            />
            <Form.Input
                className="body2 mB20"
                type="number"
                name={fieldNames.decimals}
                label={`${fieldDisplays.decimals}`}
                placeholder="0"
                rules={{
                    required: requiredMessage(fieldDisplays.decimals),
                    min: {
                        value: 0,
                        message: 'Value must be non-negative',
                    },
                    max: {
                        value: 255,
                        message: 'Value must be not greater than 255',
                    },
                    valueAsNumber: true,
                    validate: {
                        mustBeAnInteger,
                    },
                }}
            />
            <Form.Input
                className="body2 mB20"
                name={fieldNames.initialSupply}
                label={`${fieldDisplays.initialSupply} (Optional)`}
                placeholder="0"
                rules={{
                    validate: (initialSupply: string) => {
                        try {
                            // wait for validation until decimal field is filled
                            if (!decimals) return true;
                            // allow `initialSupply` to be an optional field and don't validate in that case
                            if (!initialSupply) return true;

                            const initialSupplyBigInt = BigInt(initialSupply);
                            TokenAmount.create(initialSupplyBigInt, decimals);
                            return true;
                        } catch (e) {
                            if (e instanceof Error) {
                                return `Not valid token amount: ${e.message}`;
                            }
                            return `Not valid token amount`;
                        }
                    },
                }}
            />
            <Form.Checkbox name={fieldNames.allowList} className="body2 mB20">
                Has allow list
            </Form.Checkbox>
            <Form.Checkbox name={fieldNames.denyList} className="body2 mB20">
                Has deny list
            </Form.Checkbox>
            <Form.Checkbox name={fieldNames.mintable} className="body2 mB20">
                Mintable
            </Form.Checkbox>
            <Form.Checkbox name={fieldNames.burnable} className="body2 mB20">
                Burnable
            </Form.Checkbox>
        </div>
    );
}
