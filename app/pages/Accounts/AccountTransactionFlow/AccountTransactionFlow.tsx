import { goBack, push, replace } from 'connected-react-router';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import BackButton from '~/cross-app-components/BackButton';
import Card from '~/cross-app-components/Card';
import Loading from '~/cross-app-components/Loading';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { stringify } from '~/utils/JSONHelper';
import { Account, AccountTransaction } from '~/utils/types';
import { SubmitTransactionLocationState } from '../SubmitTransaction/SubmitTransaction';
import routes from '~/constants/routes.json';
import MultiStepForm, {
    FormChild,
    MultiStepFormProps,
    OrRenderValues,
} from '~/components/MultiStepForm';

import styles from './AccountTransactionFlow.module.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FlowChild<F, K extends keyof F = any> extends FormChild<F, K> {
    /**
     * Page title. Overrides title defined on AccountTransactionFlow.
     */
    title?: string;
}

type FlowChildren<F extends Record<string, unknown>> = {
    [K in keyof F]: FlowChild<F, K>;
};

interface Props<F extends Record<string, unknown>, T extends AccountTransaction>
    extends Omit<
        MultiStepFormProps<F>,
        'onDone' | 'initialValues' | 'valueStore'
    > {
    /**
     * Flow title. Can be overridden for each page.
     */
    title: string;
    /**
     * Function to convert flow values into an account transaction.
     */
    convert(values: F): T;
    /**
     * Pages of the transaction flow declared as a mapping of components to corresponding substate.
     * Declaration order defines the order the pages are shown.
     */
    children: OrRenderValues<F, FlowChildren<F>>;
}

interface InternalState {
    isFirstPage: boolean;
    title?: string;
}

export default function AccountTransactionFlow<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    F extends Record<string, any>,
    T extends AccountTransaction
>({ title: baseTitle, convert, children, ...formProps }: Props<F, T>) {
    const { pathname, state } = useLocation<F | null>();
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector) as Account;
    const [
        { isFirstPage = true, title = baseTitle },
        setState,
    ] = useState<InternalState>({ isFirstPage: true });

    const onPageActive = (step: keyof F, values: Partial<F>) => {
        const flowChildren =
            typeof children === 'function' ? children(values) : children;
        const { title: childTitle } = flowChildren[step];
        const isFirst = Object.keys(flowChildren).indexOf(step as string) === 0;

        setState({ isFirstPage: isFirst, title: childTitle });
    };

    const handleDone = (v: F) => {
        const transaction = convert(v);
        const serialized = stringify(transaction);

        dispatch(replace(pathname, v));

        const locationState: SubmitTransactionLocationState = {
            account,
            confirmed: {
                pathname: routes.ACCOUNTS_FINAL_PAGE,
                state: {
                    transaction: serialized,
                },
            },
            transaction: serialized,
        };

        dispatch(
            push({ pathname: routes.SUBMITTRANSFER, state: locationState })
        );
    };

    return (
        <Card className={styles.root}>
            {isFirstPage || (
                <BackButton
                    className={styles.backButton}
                    onClick={() => dispatch(goBack())}
                />
            )}
            <h3 className="mT0 bodyEmphasized">{title}</h3>
            <MultiStepForm<F>
                initialValues={state ?? undefined}
                onDone={handleDone}
                onPageActive={onPageActive}
                {...formProps}
            >
                {children}
            </MultiStepForm>
        </Card>
    );
}

export const AccountTransactionFlowLoading = ({
    title,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
Pick<Props<any, any>, 'title'>) => (
    <Card className={styles.root}>
        <h3 className="mT0 bodyEmphasized">{title}</h3>
        <Loading text="Loading transaction dependencies" inline />
    </Card>
);
