import React, { FunctionComponentElement, useState } from 'react';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import TabbedCardTab, { TabbedCardTabRef } from './TabbedCardTab';
import { ClassName, PropsOf } from '~/utils/types';
import { noOp } from '~/utils/basicHelpers';

import styles from './TabbedCard.module.scss';

type TabChild = FunctionComponentElement<PropsOf<typeof TabbedCardTab>>;

interface Props extends ClassName {
    children: TabChild[];
}

function TabbedCard({ children, className }: Props) {
    const tabs = React.Children.toArray(children) as TabChild[];
    const initActiveTab =
        tabs
            .map<[TabChild, number]>((t, i) => [t, i])
            .filter(([t]) => t.props.initActive)?.[0]?.[1] ?? 0;
    const [active, setActive] = useState(initActiveTab);

    tabs.forEach((t, i) => {
        if (!t.ref) {
            return;
        }

        const instance: TabbedCardTabRef = { focus: () => setActive(i) };

        if (typeof t.ref === 'function') {
            t.ref(instance);
        } else {
            (t.ref.current as TabbedCardTabRef) = instance;
        }
    });

    return (
        <Card className={className}>
            <div className={styles.header}>
                {tabs
                    .map((t) => t.props)
                    .map(({ header, onClick = noOp }, i) => (
                        <Button
                            clear
                            className={styles.button}
                            // eslint-disable-next-line react/no-array-index-key
                            key={i}
                            onClick={() => {
                                onClick();
                                setActive(i);
                            }}
                            disabled={i === active}
                        >
                            {header}
                        </Button>
                    ))}
            </div>
            {tabs.find((_, i) => i === active)?.props.children}
        </Card>
    );
}

TabbedCard.Tab = TabbedCardTab;

export default TabbedCard;
