import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import {
    Button,
    Checkbox,
    Divider,
    Form,
    Grid,
    Header,
    Segment,
} from 'semantic-ui-react';
import { LocationDescriptorObject } from 'history';
import routes from '../../constants/routes.json';
import { UpdateInstruction } from '../../utils/types';
import TransactionHashView from '../TransactionHashView';
import TransactionDetails from '../TransactionDetails';
import { saveFile } from '../../utils/FileHelper';

interface Props {
    location: LocationDescriptorObject<Input>;
}

interface Input {
    signature: string;
    transaction: UpdateInstruction;
    transactionHash: string;
}

/**
 * Component that contains a button for exporting the signed transaction that is
 * currently being processed.
 */
export default function ExportSignedTransactionView({ location }: Props) {
    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error(
            'The component received invalid input without the expected state.'
        );
    }

    const { signature } = location.state;
    const { transaction } = location.state;
    const { transactionHash } = location.state;

    async function exportSignedTransaction() {
        const signedTransaction = {
            ...transaction,
            signatures: [signature],
        };
        const signedTransactionJson = JSON.stringify(signedTransaction);

        try {
            await saveFile(signedTransactionJson, 'Export signed transaction');
            dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS }));
        } catch (err) {
            // TODO Handle error by showing it to the user.
        }
    }

    return (
        <Segment>
            <Header textAlign="center">
                Transaction signing confirmation | Transaction Type
            </Header>
            <Divider />
            <Grid columns={2} divided textAlign="center" padded>
                <Grid.Row>
                    <Grid.Column>
                        <TransactionDetails updateInstruction={transaction} />
                    </Grid.Column>
                    <Grid.Column>
                        <TransactionHashView
                            transactionHash={transactionHash}
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Form>
                        <Form.Field>
                            <Checkbox
                                label="The hash matches the one received exactly"
                                defaultChecked
                                readOnly
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                label="The picture matches the one received exactly"
                                defaultChecked
                                readOnly
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                label="The transaction details are correct"
                                defaultChecked
                                readOnly
                            />
                        </Form.Field>
                        <Form.Field>
                            <Button
                                primary
                                fluid
                                onClick={exportSignedTransaction}
                            >
                                Export signed transaction
                            </Button>
                        </Form.Field>
                    </Form>
                </Grid.Row>
            </Grid>
        </Segment>
    );
}
