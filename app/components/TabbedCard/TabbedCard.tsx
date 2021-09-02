import React, { ReactElement, useState } from 'react';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import TabbedCardTab, { TabbedCardTabProps } from './TabbedCardTab';

import styles from './TabbedCard.module.scss';
import { ClassName } from '~/utils/types';

type TabChild = ReactElement<TabbedCardTabProps>;

interface Props extends ClassName {
    children: TabChild[];
}

function TabbedCard({ children, className }: Props) {
    const [active, setActive] = useState(0);

    const tabs = React.Children.toArray(children) as TabChild[];

    return (
        <Card className={className}>
            <div className={styles.header}>
                {tabs
                    .map((t) => t.props.header)
                    .map((h, i) => (
                        <Button
                            clear
                            className={styles.button}
                            key={h}
                            onClick={() => setActive(i)}
                            disabled={i === active}
                        >
                            {h}
                        </Button>
                    ))}
            </div>
            {tabs.find((_, i) => i === active)?.props.children}
        </Card>
    );
}

TabbedCard.Tab = TabbedCardTab;

export default TabbedCard;
