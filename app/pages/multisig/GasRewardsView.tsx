import React from 'react';
import { Label } from 'semantic-ui-react';
import { GasRewards } from '../../utils/types';

interface Props {
    gasRewards: GasRewards;
}

/**
 * Displays an overview of a gas rewards transaction payload.
 */
export default function GasRewardsView({ gasRewards }: Props) {
    return <Label size="big">GasRewards view. {gasRewards.baker}</Label>;
}
