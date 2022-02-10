import React from 'react';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import Button from '~/cross-app-components/Button';
import { useCalcBakerStakeCooldownUntil } from '~/utils/dataHooks';
import { getFormattedDateString } from '~/utils/timeHelpers';
import { AccountInfo } from '~/utils/types';

import styles from './DelegationPage.module.scss';
import { withPendingDelegationChangeGuard } from './util';

interface RemoveDelegationPageProps
    extends Pick<MultiStepFormPageProps<undefined>, 'onNext'> {
    // eslint-disable-next-line react/no-unused-prop-types
    accountInfo: AccountInfo | undefined;
}

const RemoveDelegationPage = withPendingDelegationChangeGuard(
    ({ onNext }: RemoveDelegationPageProps) => {
        const cooldownUntil = useCalcBakerStakeCooldownUntil();

        return (
            <>
                <p className="flexChildFill">
                    This will withdraw the delegated amount of the account.
                    After the grace period the full delegated amount will be
                    unlocked for disposal.
                    {cooldownUntil && (
                        <>
                            <br />
                            <br />
                            The grace period lasts until
                            <span className="block bodyEmphasized mV10">
                                {getFormattedDateString(cooldownUntil)}.
                            </span>
                        </>
                    )}
                </p>
                <Button
                    onClick={() => onNext(undefined)}
                    className={styles.continue}
                >
                    Continue
                </Button>
            </>
        );
    }
);

export default RemoveDelegationPage;
