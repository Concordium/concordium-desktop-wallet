import React, { useState } from 'react';
import Modal from 'react-modal';
import styles from './Styling.css';

export interface Props {
    Accessor: JSX.Element; // Must have a open props
    Body: JSX.Element; // Must have a close props
}

export default function FunctionalModal({ Accessor, Body }: Props) {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const setModalIsOpenToTrue = () => {
        setModalIsOpen(true);
    };

    const setModalIsOpenToFalse = () => {
        setModalIsOpen(false);
    };

    return (
        <>
            <Accessor open={setModalIsOpenToTrue} />
            <Modal
                isOpen={modalIsOpen}
                ariaHideApp={false}
                className={styles.modal}
            >
                <Body close={setModalIsOpenToFalse} />
            </Modal>
        </>
    );
}
