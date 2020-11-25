import React, { useState } from 'react';
import Modal from 'react-modal';

export default function FunctionalModal (entrance, body){

    const [modalIsOpen,setModalIsOpen] = useState(false);

    const setModalIsOpenToTrue =()=>{
        setModalIsOpen(true)
    }

    const setModalIsOpenToFalse =()=>{
        setModalIsOpen(false)
    }

    return (
        <>
            {entrance(setModalIsOpenToTrue)}
            <Modal isOpen={modalIsOpen}  ariaHideApp={false}>
                {body(setModalIsOpenToFalse)}
            </Modal>
        </>
    )
}

