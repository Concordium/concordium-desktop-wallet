import { useMemo } from 'react';

import { toFraction, toResolution } from '~/utils/numberStringHelpers';

interface GetConverters {
    safeToFraction(value?: string | bigint | undefined): string | undefined;
    safeToResolution(value?: string | undefined): bigint | undefined;
    isNormalised: boolean;
}

// eslint-disable-next-line import/prefer-default-export
export const useNormalisation = (denominator: bigint): GetConverters =>
    useMemo(() => {
        try {
            return {
                safeToFraction: toFraction(denominator),
                safeToResolution: toResolution(denominator),
                isNormalised: true,
            };
        } catch {
            return {
                safeToFraction: (v) => v?.toString(),
                safeToResolution: BigInt,
                isNormalised: false,
            };
        }
    }, [denominator]);
