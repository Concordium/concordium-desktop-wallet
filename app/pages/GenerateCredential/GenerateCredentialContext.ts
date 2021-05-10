import { createContext, Dispatch, SetStateAction } from 'react';
import { noOp } from '~/utils/basicHelpers';
import { AttributeKey } from '~/utils/identityHelpers';
import { Identity } from '~/utils/types';
import { CredentialBlob } from './types';

type StateTuple<S> = [S, Dispatch<SetStateAction<S>>];

interface GenerateCredentialState {
    credential: StateTuple<CredentialBlob | undefined>;
    isReady: StateTuple<boolean>;
    address: StateTuple<string>;
    attributes: StateTuple<AttributeKey[]>;
    identity: StateTuple<Identity | undefined>;
}

const generateCredentialContext = createContext<GenerateCredentialState>({
    address: ['', noOp],
    credential: [undefined, noOp],
    identity: [undefined, noOp],
    attributes: [[], noOp],
    isReady: [false, noOp],
});

export default generateCredentialContext;
