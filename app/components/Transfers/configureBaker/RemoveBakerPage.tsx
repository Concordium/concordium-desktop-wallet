import React from 'react';
import BakerPendingChange from '~/components/BakerPendingChange';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import Button from '~/cross-app-components/Button';
import { useCalcBakerStakeCooldownUntil } from '~/utils/dataHooks';
import { getFormattedDateString } from '~/utils/timeHelpers';
import { AccountInfo } from '~/utils/types';

import styles from './ConfigureBakerPage.module.scss';

interface DelegationStatusPageProps
    extends Pick<MultiStepFormPageProps<undefined>, 'onNext'> {
    accountInfo: AccountInfo | undefined;
}

const RemoveBakerPage = ({
    onNext,
    accountInfo,
}: DelegationStatusPageProps) => {
    const cooldownUntil = useCalcBakerStakeCooldownUntil();

    const pendingChange = accountInfo?.accountBaker?.pendingChange;

    return (
        <>
            {pendingChange ? (
                <p>
                    Cannot remove baker at this time:
                    <div className="bodyEmphasized textError mV10">
                        <BakerPendingChange pending={pendingChange} />
                    </div>
                    It will be possible to proceed after this time has passed.
                </p>
            ) : (
                <>
                    <p className="flexChildFill">
                        This will remove the baker status of the account. After
                        the grace period the full staked amount will be unlocked
                        for disposal.
                        {cooldownUntil && (
                            <>
                                <br />
                                <br />
                                The grace period lasts until
                                <div className="bodyEmphasized  mV10">
                                    {getFormattedDateString(cooldownUntil)}.
                                </div>
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
            )}
        </>
    );
};

export default RemoveBakerPage;
