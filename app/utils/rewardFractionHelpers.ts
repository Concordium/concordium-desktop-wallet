import updateConstants from '~/constants/updateConstants.json';

export const fractionResolution = updateConstants.rewardFractionResolution;
export const percentageModifier = fractionResolution / 100;

export const fractionResolutionToPercentage = (v: number) =>
    v / percentageModifier;

export const percentageToFractionResolution = (v: number) =>
    v * percentageModifier;
