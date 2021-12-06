import React from 'react';
import type { LocationDescriptorObject } from 'history';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import Modal from '~/cross-app-components/Modal';
import Button from '~/cross-app-components/Button';
import { noOp } from '~/utils/basicHelpers';

export interface Action {
    label: string;
    inverted?: boolean;
    action(): void;
}

export interface LocationAction extends Omit<Action, 'action'> {
    location?: LocationDescriptorObject | string;
}

function isAction(action: Action | LocationAction): action is Action {
    return (action as Action).action !== undefined;
}

interface Props {
    title: string;
    description: string | JSX.Element;
    actions: (Action | LocationAction)[];
    open: boolean;
    postAction?(location?: string | LocationDescriptorObject): void;
    disableClose?: boolean;
    onClose?(): void;
}

export default function ChoiceModal({
    title,
    description,
    actions,
    open,
    postAction = noOp,
    disableClose = false,
    onClose = noOp,
}: Props) {
    const dispatch = useDispatch();
    return (
        <Modal disableClose={disableClose} open={open} onClose={onClose}>
            <h3>{title}</h3>
            {typeof description === 'string' ? (
                <p>{description}</p>
            ) : (
                <div>{description}</div>
            )}
            <div className="flex justifySpaceBetween mT30">
                {actions.map((a, i) => (
                    <Button
                        inverted={a.inverted}
                        className={clsx('flexChildFill', i !== 0 && 'mL30')}
                        key={a.label}
                        onClick={() => {
                            if (isAction(a)) {
                                a.action();
                            } else if (a.location) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                dispatch(push(a.location as any));
                                postAction(a.location);
                                return;
                            }
                            postAction();
                        }}
                    >
                        {a.label}
                    </Button>
                ))}
            </div>
        </Modal>
    );
}
