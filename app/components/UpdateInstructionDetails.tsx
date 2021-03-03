import { UpdateInstruction, UpdateInstructionPayload } from '../utils/types';
import findHandler from '../utils/updates/HandlerFinder';

interface Props {
    transaction: UpdateInstruction<UpdateInstructionPayload>;
}

/**
 * Component that displays the details of an UpdateInstruction in a human readable way.
 * @param {UpdateInstruction} transaction: The transaction, which details is displayed.
 */
export default function UpdateInstructionDetails({
    transaction,
}: Props): JSX.Element {
    const handler = findHandler(transaction.type);
    return handler.view(transaction);
}
