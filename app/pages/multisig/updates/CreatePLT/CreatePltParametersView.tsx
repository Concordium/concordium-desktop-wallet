import React from 'react';
import { Cbor, CreatePLTPayload, TokenInitializationParameters } from '@concordium/web-sdk/plt';

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
    createPltParameters: { decimals, tokenId, moduleRef, initializationParameters },
    consensusStatus,
}: Props) {
    if (!consensusStatus) {
        return <Loading inline />;
    }

    // TODO: decoding problem as `hasOwn` function not available
    let test: TokenInitializationParameters = Cbor.decode(initializationParameters, 'TokenInitializationParameters');
    console.log(test)
    return (
        <>
            <div>
                <Label className="mB5">
                    {fieldDisplays.tokenId}:
                </Label>
                <div className="body3 mono mB20">{tokenId.toString()}</div>
            </div>
            {/* <div>
                <Label className="mB5">
                    {fieldDisplays.name}:
                </Label>
                <div className="body3 mono mB20">{name}</div>
            </div> */}
            <div>
                <Label className="mB5">
                    {fieldDisplays.moduleRef}:
                </Label>
                <div className="body3 mono mB20">{moduleRef.toString()}</div>
            </div>
            {/* <div>
                   <Label className="mB5">
                    {fieldDisplays.metadataUrl}:
                </Label>
                <div className="body3 mono mB20">{metadataUrl}</div>
            </div>
             <div>
                  <Label className="mB5">
                    {fieldDisplays.metadataHash}:
                </Label>
                <div className="body3 mono mB20">{metadataHash}</div>
            </div>
             <div>
                <Label className="mB5">
                    {fieldDisplays.governanceAccount}:
                </Label>
                <div className="body3 mono mB20">{governanceAccount}</div>
            </div> */}
            <div>
                <Label className="mB5">
                    {fieldDisplays.decimals}:
                </Label>
                <div className="body3 mono mB20">{decimals.toString()}</div>
            </div>
            {/* <div>
               <Label className="mB5">
                    {fieldDisplays.initialSupply}:
                </Label>
                <div className="body3 mono mB20">{initialSupply.toString()}</div>
            </div>
             <div>
                <Label className="mB5">
                    {fieldDisplays.allowList}:
                </Label>
                <div className="body3 mono mB20">{allowList}</div>
            </div>
             <div>
                <Label className="mB5">
                    {fieldDisplays.denyList}:
                </Label>
                <div className="body3 mono mB20">{denyList.toString()}</div>
            </div>
             <div>
                <Label className="mB5">
                    {fieldDisplays.mintable}:
                </Label>
                <div className="body3 mono mB20">{mintable.toString()}</div>
            </div>
             <div>
                <Label className="mB5">
                    {fieldDisplays.burnable}:
                </Label>
                <div className="body3 mono mB20">{burnable.toString()}</div>
            </div> */}
        </>
    );
});
