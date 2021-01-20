import React from 'react';
import { useDispatch } from 'react-redux';
import { Header, Menu } from 'semantic-ui-react';
import { chooseMenuItem } from '../../features/MultiSignatureSlice';

/**
 * An enumeration that contains the menu items available in the menu
 * on the multisignature page.
 */
export enum MultiSignatureMenuItems {
    MakeNewProposal,
    ProposedTransactions,
    SignTransaction,
}

/**
 * A component that displays the list of menu items available for the multi signature
 * transaction functionality.
 */
export default function MultiSignatureList() {
    const dispatch = useDispatch();

    return (
        <Menu vertical fluid>
            {Object.keys(MultiSignatureMenuItems)
                .filter((key) => isNaN(Number(key)))
                .map((item, index) => (
                    <Menu.Item
                        index={index}
                        key={item}
                        onClick={() => dispatch(chooseMenuItem(item))}
                    >
                        <Header>{item}</Header>
                    </Menu.Item>
                ))}
        </Menu>
    );
}
