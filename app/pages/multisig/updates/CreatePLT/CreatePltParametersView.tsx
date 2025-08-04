import React from 'react';
import { CreatePLTPayload } from '@concordium/web-sdk/plt';

import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';
import { fieldDisplays } from './CreatePltParameters';

interface Props extends ChainData {
    createPltParameters: CreatePLTPayload;
}

/**
 * Displays an overview of an update create PLT transaction transaction payload.
 */
export default withChainData(function CreatePltParametersView({
    createPltParameters: { decimals},
    consensusStatus,
}: Props) {
    if (!consensusStatus) {
        return <Loading inline />;
    }

    return (
        <>
            <div>
                {/* TODO: display the other fields */}
                <Label className="mB5">
                    {fieldDisplays.decimals}:
                </Label>
                <div className="body3 mono mB20">{decimals.toString()}</div>
            </div>
        </>
    );
});
