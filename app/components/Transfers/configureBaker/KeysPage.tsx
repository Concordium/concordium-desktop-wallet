import React from 'react';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { BakerKeys } from '~/utils/rustInterface';
import { Account } from '~/utils/types';
import GenerateBakerKeys from './GenerateBakerKeys';

interface GenerateKeysPageProps
    extends Omit<MultiStepFormPageProps<BakerKeys>, 'formValues'> {
    account: Account;
}

const KeysPage = ({ onNext, initial, account }: GenerateKeysPageProps) => (
    <GenerateBakerKeys
        onContinue={onNext}
        account={account}
        initialKeys={initial}
        keyVariant="CONFIGURE"
    />
);

export default KeysPage;
