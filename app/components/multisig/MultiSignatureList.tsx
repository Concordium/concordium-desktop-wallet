import React from 'react';
import { useDispatch } from 'react-redux';
import { Header, Menu } from 'semantic-ui-react';
import { chooseMenuItem } from '../../features/MultiSignatureSlice';
import { MultiSignatureMenuItems } from '../../utils/types';

/**
 * A component that displays the list of menu items available for the multi signature
 * transaction functionality.
 */
export default function MultiSignatureList() {
    const dispatch = useDispatch();

    return (
        <Menu vertical fluid>
            {Object.keys(MultiSignatureMenuItems)
                .filter((key) => Number.isNaN(Number(key)))
                .map((item) => (
                    <Menu.Item
                        key={item}
                        onClick={() => dispatch(chooseMenuItem(item))}
                    >
                        <Header>{item}</Header>
                    </Menu.Item>
                ))}
        </Menu>
    );
}
