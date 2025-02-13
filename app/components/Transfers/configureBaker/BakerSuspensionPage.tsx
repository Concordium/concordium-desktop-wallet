import React from 'react';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import Button from '~/cross-app-components/Button';
import { AccountInfo } from '~/utils/types';
import { withPendingBakerChangeGuard } from './util';

import styles from './ConfigureBakerPage.module.scss';

type Props = Pick<MultiStepFormPageProps<boolean>, 'onNext'> & {
    accountInfo: AccountInfo | undefined;
    isSuspended: boolean;
};

const BakerSuspensionPage = withPendingBakerChangeGuard(
    ({ onNext, isSuspended }: Props) => (
        <>
            <p className="flexChildFill">
                Submitting this transaction will{' '}
                {isSuspended ? 'resume' : 'suspend'} validation for the selected
                validator account.
            </p>
            <Button
                onClick={() => onNext(!isSuspended)}
                className={styles.continue}
            >
                Continue
            </Button>
        </>
    )
);

export default BakerSuspensionPage;
