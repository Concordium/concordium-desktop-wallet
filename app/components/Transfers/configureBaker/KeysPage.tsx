import React from 'react';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { BakerKeys } from '~/utils/rustInterface';
import { Dependencies } from '~/utils/transactionFlows/configureBaker';
import GenerateBakerKeys from './GenerateBakerKeys';

type GenerateKeysPageProps = MultiStepFormPageProps<BakerKeys> &
    Pick<Dependencies, 'account'>;

const KeysPage = ({ onNext, initial, account }: GenerateKeysPageProps) => (
    <GenerateBakerKeys
        onContinue={onNext}
        account={account}
        initialKeys={initial}
        keyVariant="ADD"
    />
);

export default KeysPage;
