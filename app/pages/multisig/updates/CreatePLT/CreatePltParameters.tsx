import React from 'react';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form/';
import { mustBeAnInteger, requiredMessage, enterHere } from '../common/util';

export interface UpdateCreatePltParametersFields {
    decimals: bigint,
    initialSupply: 'initialSupply',
}

const fieldNames: EqualRecord<UpdateCreatePltParametersFields> = {
    decimals: 'decimals',
    initialSupply: 'initialSupply',
};

export const fieldDisplays = {
    // TODO:
    // tokenId     
    // tokenModule 
    // governanceAccount 
    // name   
    // metadata     
    // allowList   
    // denyList
    // mintable
    // burnable
    decimals: 'Decimals',
    initialSupply: 'InitialSupply',
};

/**
 * Component for creating an update create PLT transaction.
 */
export default function CreatePltParameters({
}: UpdateProps): JSX.Element | null {
    return (
        <div>           
            <Form.Input
                className="body2 mB20"
                name={fieldNames.decimals}
                defaultValue={
                    0
                }
                label={`${fieldDisplays.decimals}`}
                placeholder={enterHere(fieldDisplays.decimals)}
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
                defaultValue={
                    0
                }
                label={`${fieldDisplays.initialSupply}`}
                placeholder={enterHere(fieldDisplays.initialSupply)}
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
        </div>
    );
}
