import React, { useState } from 'react';
import Modal from 'react-modal';

const modalStyle = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    }
};

export default function FunctionalModal(entrance, body) {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const setModalIsOpenToTrue = () => {
        setModalIsOpen(true);
    };

    const setModalIsOpenToFalse = () => {
        setModalIsOpen(false);
    };

    return (
        <>
            {entrance(setModalIsOpenToTrue)}
            <Modal isOpen={modalIsOpen} ariaHideApp={false} style={modalStyle}>
                {body(setModalIsOpenToFalse)}
            </Modal>
        </>
    );
}
