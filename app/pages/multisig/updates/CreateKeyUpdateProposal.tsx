import React from 'react';
import { Route, Switch } from 'react-router';
import Columns from '~/components/Columns';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { UpdateComponent } from '~/utils/transactionTypes';
import routes from '~/constants/routes.json';
import styles from '../common/MultiSignatureFlowPage.module.scss';
import ProposeNewKey from './UpdateHigherLevelKeys/ProposeNewKey';

interface Props {
    blockSummary?: BlockSummary;
    UpdateComponentInput: UpdateComponent;
}

/**
 * Component used for the subset of update instructions that are used to update the
 * authorization key sets.
 */
export default function CreateKeyUpdateProposal({
    blockSummary,
    UpdateComponentInput,
}: Props) {
    return (
        <Columns divider columnScroll columnClassName={styles.column}>
            <Columns.Column header="Transaction Details">
                <div className={styles.columnContent}>
                    {blockSummary && (
                        <UpdateComponentInput blockSummary={blockSummary} />
                    )}
                </div>
            </Columns.Column>
            <Columns.Column className={styles.stretchColumn}>
                <div className={styles.columnContent}>
                    <Switch>
                        <Route
                            path={routes.MULTISIGTRANSACTIONS_PROPOSAL}
                            render={() => <ProposeNewKey />}
                        />
                    </Switch>
                </div>
            </Columns.Column>
        </Columns>
    );
}
