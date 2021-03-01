import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { Button, Card, Header } from 'semantic-ui-react';
import {
    addressBookSelector,
    chosenIndexSelector,
    removeFromAddressBook,
} from '../../features/AddressBookSlice';
import DeleteAddress from './DeleteAddress';
import UpsertAddress from '../../components/UpsertAddress';
import Card from '../../cross-app-components/Card';
import Button from '../../cross-app-components/Button';

export default function AddressBookElementView() {
    const dispatch = useDispatch();
    const chosenIndex = useSelector(chosenIndexSelector);
    const addressBook = useSelector(addressBookSelector);
    const chosenEntry = addressBook[chosenIndex];

    if (chosenIndex >= addressBook.length) {
        return null;
    }

    return (
        <Card>
            <div>
                <h2>{chosenEntry.name}</h2>
                <UpsertAddress
                    as={Button}
                    disabled={chosenEntry.readOnly}
                    initialValues={chosenEntry}
                    clear
                >
                    Edit
                </UpsertAddress>
                <DeleteAddress
                    entry={chosenEntry}
                    onRemove={(entry) => removeFromAddressBook(dispatch, entry)}
                />
            </div>
            <div>
                {chosenEntry.address}
                <button type="submit">Copy</button>
            </div>
            <div>
                <h3>Notes</h3>
                {chosenEntry.note}
            </div>
        </Card>
    );

    // return (
    //     <Card fluid>
    //         <Card.Content>
    //             <Card.Header textAlign="center">{chosenEntry.name}</Card.Header>
    //             <Card.Description textAlign="center">
    //                 <Header size="small">Account address</Header>
    //                 {chosenEntry.address}
    //             </Card.Description>
    //             <Card.Description textAlign="center">
    //                 <Header size="small">Notes</Header>
    //                 {chosenEntry.note}
    //             </Card.Description>
    //         </Card.Content>
    //         <Button.Group>
    //             <UpsertAddress
    //                 as={Button}
    //                 disabled={chosenEntry.readOnly}
    //                 initialValues={chosenEntry}
    //             >
    //                 Edit
    //             </UpsertAddress>
    //             <DeleteAddress
    //                 entry={chosenEntry}
    //                 onRemove={(entry) => removeFromAddressBook(dispatch, entry)}
    //             />
    //         </Button.Group>
    //     </Card>
    // );
}
