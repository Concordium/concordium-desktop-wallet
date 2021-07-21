import React from 'react';
import clsx from 'clsx';
import Modal from '~/cross-app-components/Modal';
import Button from '~/cross-app-components/Button';
import { noOp } from '~/utils/basicHelpers';

export interface ResolveModalInput {
    open: boolean;
    header?: string;
    description?: string;
    choices?: string[];
    onResolve?: (choice: string) => void;
}

export default function ResolveModal({
    header = '',
    description = '',
    choices = [],
    open,
    onResolve = noOp,
}: ResolveModalInput) {
    return (
        <Modal open={open}>
            <h3>{header}</h3>
            <p>{description}</p>
            <div className="flex justifySpaceBetween mT30">
                {choices.map((choice, i) => (
                    <Button
                        className={clsx('flexChildFill', i !== 0 && 'mL30')}
                        key={choice}
                        onClick={() => {
                            onResolve(choice);
                        }}
                    >
                        {choice}
                    </Button>
                ))}
            </div>
        </Modal>
    );
}
