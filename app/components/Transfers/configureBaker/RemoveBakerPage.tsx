import React from 'react';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import Button from '~/cross-app-components/Button';
import { useCalcBakerStakeCooldownUntil } from '~/utils/dataHooks';
import { getFormattedDateString } from '~/utils/timeHelpers';
import { AccountInfo } from '~/utils/types';

import styles from './ConfigureBakerPage.module.scss';
import { withPendingChangeGuard } from './util';

interface DelegationStatusPageProps
    extends Pick<MultiStepFormPageProps<undefined>, 'onNext'> {
    accountInfo: AccountInfo | undefined;
}

const RemoveBakerPage = withPendingChangeGuard(
    ({ onNext }: DelegationStatusPageProps) => {
        const cooldownUntil = useCalcBakerStakeCooldownUntil();

        return (
            <>
                <p className="flexChildFill">
                    This will remove the baker status of the account. After the
                    grace period the full staked amount will be unlocked for
                    disposal.
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

export default RemoveBakerPage;
