import React from 'react';

import RewardDistributionField from './RewardDistributionField';
import styles from './RewardDistribution.module.scss';

export default function RewardDistribution(): JSX.Element {
    return (
        <div className={styles.root}>
            <header className={styles.header}>
                <div>
                    <span>Baking reward account</span>
                    <span>60%</span>
                </div>
                <div>
                    <span>Finalization reward account</span>
                    <span>30%</span>
                </div>
                <div>10%</div>
            </header>
            <RewardDistributionField
                className={styles.first}
                label="Baking reward account"
                value="50.000%"
                onChange={() => null}
                onBlur={() => null}
            />
            <RewardDistributionField
                className={styles.middle}
                label="Finalization reward account"
                value="50.000%"
                onChange={() => null}
                onBlur={() => null}
            />
            <RewardDistributionField
                className={styles.last}
                label="Foundation"
                value="10.000%"
                onChange={() => null}
                onBlur={() => null}
            />
        </div>
    );
}
