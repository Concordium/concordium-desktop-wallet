import React from 'react';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form/';
import { mustBeAnInteger, requiredMessage } from '../common/util';

export interface UpdateCreatePltParametersFields {
    tokenId: string;
    name: string;
    moduleRef: string;
    metadataUrl: string;
    metadataHash: string | undefined;
    governanceAccount: string;
    decimals: number;
    initialSupply: bigint;
    allowList: boolean;
    denyList: boolean;
    mintable: boolean;
    burnable: boolean;
}

const fieldNames: EqualRecord<UpdateCreatePltParametersFields> = {
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
    tokenId: 'TokenId',
    name: 'Name',
    moduleRef: 'ModuleRef',
    metadataUrl: 'MetadataUrl',
    metadataHash: 'MetadataHash',
    governanceAccount: 'GovernanceAccount',
    decimals: 'Decimals',
    initialSupply: 'InitialSupply',
    allowList: 'AllowList',
    denyList: 'DenyList',
    mintable: 'Mintable',
    burnable: 'Burnable',
};

/**
 * Component for creating an update create PLT transaction.
 */
export default function CreatePltParameters({}: UpdateProps): JSX.Element | null {
    return (
        <div>
            <Form.Input
                className="body2 mB20"
                name="tokenId"
                label="Token ID"
                maxLength={128}
                pattern="^[a-zA-Z0-9.%-]{1,128}$"
                placeholder="Alphanumeric and . % - (max 128 chars)"
                rules={{
                    required: requiredMessage(fieldDisplays.tokenId),
                    validate: (value: string) => {
                        const cleaned = value.replace(/[^a-zA-Z0-9.%-]/g, '');
                        if (cleaned.length > 128)
                            return 'Must be 128 characters or less.';
                        if (value !== cleaned)
                            return "Only letters, numbers, '.', '%', and '-' are allowed.";
                        return true;
                    },
                }}
            />
            <Form.Input
                className="body2 mB20"
                name="name"
                label="Name"
                placeholder="Token Name"
                rules={{ required: requiredMessage(fieldDisplays.name) }}
            />
            <Form.Input
                className="body2 mB20"
                name="moduleRef"
                label="Token Module Reference"
                defaultValue="5c5c2645db84a7026d78f2501740f60a8ccb8fae5c166dc2428077fd9a699a4a"
            />
            <Form.Input
                className="body2 mB20"
                name="metadataUrl"
                label="Metadata URL"
                placeholder="https://tokenWebsite.com"
                rules={{ required: requiredMessage(fieldDisplays.metadataUrl) }}
            />
            <Form.Input
                className="body2 mB20"
                name="metadataHash"
                label="Metadata Hash"
                placeholder="b27a46456f5d3c089f7ad76bbbc3525ef277532b131ffadfc2565094c4b5133a"
            />
            <Form.Input
                className="body2 mB20"
                name="governanceAccount"
                label="Governance Account"
                placeholder="4BTFaHx8CioLi8Xe7YiimpAK1oQMkbx5Wj6B8N7d7NXgmLvEZs"
                rules={{
                    required: requiredMessage(fieldDisplays.governanceAccount),
                }}
            />
            <Form.Input
                className="body2 mB20"
                name={fieldNames.decimals}
                label={`${fieldDisplays.decimals}`}
                placeholder="0"
                rules={{
                    required: requiredMessage(fieldDisplays.decimals),
                    min: {
                        value: 0,
                        message: 'Value must be non-negative',
                    },
                    validate: {
                        mustBeAnInteger,
                    },
                }}
            />
            <Form.Input
                className="body2 mB20"
                name={fieldNames.initialSupply}
                placeholder="0"
                label={`${fieldDisplays.initialSupply}`}
                rules={{
                    required: requiredMessage(fieldDisplays.initialSupply),
                    min: {
                        value: 0,
                        message: 'Value must be non-negative',
                    },
                    validate: {
                        mustBeAnInteger,
                    },
                }}
            />
            <Form.Checkbox name="allowList" className="body2 mB20">
                Has allow list
            </Form.Checkbox>
            <Form.Checkbox name="denyList" className="body2 mB20">
                Has deny list
            </Form.Checkbox>
            <Form.Checkbox name="mintable" className="body2 mB20">
                Mintable
            </Form.Checkbox>
            <Form.Checkbox name="burnable" className="body2 mB20">
                Burnable
            </Form.Checkbox>
        </div>
    );
}
