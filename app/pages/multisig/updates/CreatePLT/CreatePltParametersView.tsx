import React from 'react';

import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';
import { fieldDisplays } from './CreatePltParameters';
import { CreatePLTPayload } from '~/utils/types';
import { uint8ArrayToHex } from '~/utils/printUtility';

interface Props extends ChainData {
    createPltParameters: CreatePLTPayload;
}

/**
 * Displays an overview of an update create PLT transaction transaction payload.
 */
export default withChainData(function CreatePltParametersView({
    createPltParameters: {
        decimals,
        tokenId,
        moduleRef,
        initializationParameters,
    },
    consensusStatus,
}: Props) {
    if (!consensusStatus) {
        return <Loading inline />;
    }

    return (
        <>
            <div>
                <Label className="mB5">{fieldDisplays.tokenId}:</Label>
                <div className="body3 mono mB20">{tokenId.toString()}</div>
            </div>
            <div>
                <Label className="mB5">{fieldDisplays.name}:</Label>
                <div className="body3 mono mB20">
                    {initializationParameters.name}
                </div>
            </div>
            <div>
                <Label className="mB5">{fieldDisplays.moduleRef}:</Label>
                <div className="body3 mono mB20">{moduleRef.toString()}</div>
            </div>
            <div>
                <Label className="mB5">{fieldDisplays.metadataUrl}:</Label>
                <div className="body3 mono mB20">
                    {initializationParameters.metadata.url}
                </div>
            </div>
            {initializationParameters.metadata.checksumSha256 && (
                <div>
                    <Label className="mB5">{fieldDisplays.metadataHash}:</Label>
                    <div className="body3 mono mB20">
                        {uint8ArrayToHex(
                            initializationParameters.metadata.checksumSha256
                                ?.buffer
                        )}
                    </div>
                </div>
            )}
            <div>
                <Label className="mB5">
                    {fieldDisplays.governanceAccount}:
                </Label>
                <div className="body3 mono mB20">
                    {initializationParameters.governanceAccount.address.address}
                </div>
            </div>
            <div>
                <Label className="mB5">{fieldDisplays.decimals}:</Label>
                <div className="body3 mono mB20">{decimals.toString()}</div>
            </div>
            <div>
                <Label className="mB5">{fieldDisplays.initialSupply}:</Label>
                <div className="body3 mono mB20">
                    {initializationParameters.initialSupply?.value?.toString() ??
                        '0'}
                </div>
            </div>
            <div>
                <Label className="mB5">{fieldDisplays.allowList}:</Label>
                <div className="body3 mono mB20">
                    {initializationParameters.allowList?.toString() ?? 'False'}
                </div>
            </div>
            <div>
                <Label className="mB5">{fieldDisplays.denyList}:</Label>
                <div className="body3 mono mB20">
                    {initializationParameters.denyList?.toString() ?? 'False'}
                </div>
            </div>
            <div>
                <Label className="mB5">{fieldDisplays.mintable}:</Label>
                <div className="body3 mono mB20">
                    {initializationParameters.mintable?.toString() ?? 'False'}
                </div>
            </div>
            <div>
                <Label className="mB5">{fieldDisplays.burnable}:</Label>
                <div className="body3 mono mB20">
                    {initializationParameters.burnable?.toString() ?? 'False'}
                </div>
            </div>
        </>
    );
});
