import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import styles from './ScrollContainer.module.scss';

export default function ScrollContainer({
    children,
}: PropsWithChildren<unknown>) {
    const [overflowing, setOverflowing] = useState(false);
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onResize = () => {
            setOverflowing(
                (inner.current?.clientHeight ?? 0) >
                    (outer.current?.clientHeight ?? 0)
            );
        };
        window.addEventListener('resize', onResize);

        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <div className={styles.scrollContainer}>
            <div className={clsx(!overflowing && styles.centered)} ref={outer}>
                <div ref={inner}>{children}</div>
            </div>
        </div>
    );
}
