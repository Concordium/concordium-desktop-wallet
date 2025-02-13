import React from 'react';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import Button from '~/cross-app-components/Button';
import { useCalcBakerStakeCooldownUntil } from '~/utils/dataHooks';
import { getFormattedDateString } from '~/utils/timeHelpers';
import { AccountInfo } from '~/utils/types';
import { withPendingBakerChangeGuard } from './util';

import styles from './ConfigureBakerPage.module.scss';

interface RemoveBakerPageProps
    extends Pick<MultiStepFormPageProps<undefined>, 'onNext'> {
    accountInfo: AccountInfo | undefined;
}

const RemoveBakerPage = withPendingBakerChangeGuard(
    ({ onNext }: RemoveBakerPageProps) => {
        const cooldownUntil = useCalcBakerStakeCooldownUntil();

        return (
            <>
                <p className="flexChildFill">
                    This will return the staked amount to the public balance of
                    the account at the first pay day after a cooldown period.
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

export default RemoveBakerPage;
