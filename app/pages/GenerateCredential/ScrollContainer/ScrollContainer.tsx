/* eslint-disable react-hooks/exhaustive-deps */
import React, {
    PropsWithChildren,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import clsx from 'clsx';

import styles from './ScrollContainer.module.scss';

export default function ScrollContainer({
    children,
}: PropsWithChildren<unknown>) {
    const [overflowing, setOverflowing] = useState(false);
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);
    const onResize = useCallback(() => {
        setOverflowing(
            (inner.current?.clientHeight ?? 0) >
                (outer.current?.clientHeight ?? 0)
        );
    }, []);

    useEffect(() => {
        window.addEventListener('resize', onResize);

        return () => window.removeEventListener('resize', onResize);
    }, []);

    useLayoutEffect(() => {
        onResize();
    }, [children]);

    return (
        <div className={styles.scrollContainer}>
            <div className={clsx(!overflowing && styles.centered)} ref={outer}>
                <div ref={inner}>{children}</div>
            </div>
        </div>
    );
}
