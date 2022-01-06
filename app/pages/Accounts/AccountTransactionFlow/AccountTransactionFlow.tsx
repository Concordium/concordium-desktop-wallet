import { push } from 'connected-react-router';
import React, { Children, PropsWithChildren, ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';

import styles from './AccountTransactionFlow.module.scss';

type PageProps = PropsWithChildren<{
    title?: string;
}>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FlowPage({ children: _ }: PageProps) {
    return null;
}

interface Props {
    title: string;
    children: ReactElement<PageProps> | ReactElement<PageProps>[];
}

export default function AccountTransactionFlow({
    title: baseTitle,
    children,
}: Props) {
    const { path: matchedPath } = useRouteMatch();
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const pageObjects = Children.map(children, (c, i) => ({
        title: c.props.title,
        content: c.props.children,
        route: i === 0 ? matchedPath : `${matchedPath}/${i}`,
        next:
            i === Children.count(children) - 1
                ? undefined
                : `${matchedPath}/${i + 1}`,
    })).reverse();
    const currentPage = pageObjects.find((p) => pathname.startsWith(p.route));

    if (!currentPage) {
        return null;
    }

    const { title = baseTitle, next = '' } = currentPage;

    return (
        <Card className={styles.root}>
            <h3>{title}</h3>
            <div>{JSON.stringify(currentPage)}</div>
            <Switch>
                {pageObjects.map(({ content, route }) => (
                    <Route path={route} key={route}>
                        {content}
                    </Route>
                ))}
            </Switch>
            <Button onClick={() => dispatch(push(next))}>Continue</Button>
        </Card>
    );
}

AccountTransactionFlow.Page = FlowPage;
