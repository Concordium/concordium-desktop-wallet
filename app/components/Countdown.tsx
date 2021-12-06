import React, { useEffect, useState } from 'react';
import { noOp } from '~/utils/basicHelpers';

const countdownDone = (remaining: number) => remaining <= 0;

interface Props {
    /**
     * How often to decrement from value. Defaults to 1000 (every 1s)
     */
    intervalMS?: number;
    from: number;
    /**
     * Defaults to (r) => r - 1;
     */
    decrement?(remaining: number): number;
    onEnd?(): void;
}

export default function Countdown({
    intervalMS = 1000,
    from,
    decrement = (r) => r - 1,
    onEnd = noOp,
}: Props) {
    const [remaining, setRemaining] = useState<number>(from);

    useEffect(() => {
        if (countdownDone(remaining)) {
            onEnd();
            return noOp;
        }

        const t = setTimeout(() => setRemaining(decrement), intervalMS);
        return () => clearTimeout(t);
    }, [remaining, onEnd, decrement, intervalMS]);

    return <>{remaining}</>;
}
