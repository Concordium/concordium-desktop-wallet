import React from 'react';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import Button from '~/cross-app-components/Button';
import { useCalcDelegatorCooldownUntil } from '~/utils/dataHooks';
import { getFormattedDateString } from '~/utils/timeHelpers';
import { AccountInfo } from '~/utils/types';
import { withPendingDelegationChangeGuard } from './util';

import styles from './DelegationPage.module.scss';

interface RemoveDelegationPageProps
    extends Pick<MultiStepFormPageProps<undefined>, 'onNext'> {
    // eslint-disable-next-line react/no-unused-prop-types
    accountInfo: AccountInfo | undefined; // This is needed for the pending delegation change guard HOC.
}

const RemoveDelegationPage = withPendingDelegationChangeGuard(
    ({ onNext }: RemoveDelegationPageProps) => {
        const cooldownUntil = useCalcDelegatorCooldownUntil();

        return (
            <>
                <p className="flexChildFill">
                    This will return the delegated amount to the public balance
                    of the account at the first pay day after a cooldown period.
                    {cooldownUntil && (
                        <>
                            <br />
                            <br />
                            The cooldown period ends at
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
