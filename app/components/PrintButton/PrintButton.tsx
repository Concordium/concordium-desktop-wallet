import React, { useRef, useState, PropsWithChildren } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactToPrint from 'react-to-print';
import PrinterIcon from '@resources/svg/printer.svg';
import printContent from '~/utils/printContent';
import IconButton from '~/cross-app-components/IconButton';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import errorMessages from '~/constants/errorMessages.json';
import { RootState } from '~/store/store';
import { setPrinting } from '~/features/MiscSlice';

import styles from './PrintButton.module.scss';

interface Props {
    className?: string;
    onPrint?: () => void;
}
/**
 * A button which onclick prints the referenced component.
 *
 * @example
 * <PrintButton>
 *     <ComponentsToBePrinted/>
 * </PrintButton>
 */
export default function PrintButton({
    className,
    children,
    onPrint = () => {},
}: PropsWithChildren<Props>) {
    const dispatch = useDispatch();
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const { isPrinting } = useSelector((s: RootState) => s.misc);
    const componentRef = useRef(null);

    return (
        <>
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
            <div className={styles.hidden} ref={componentRef}>
                {children}
            </div>
            <ReactToPrint
                trigger={() => (
                    <IconButton className={className}>
                        <PrinterIcon height="20" />
                    </IconButton>
                )}
                content={() => componentRef.current || null}
                print={async (htmlContentToPrint) => {
                    if (!isPrinting) {
                        dispatch(setPrinting(true));
                        return printContent(htmlContentToPrint)
                            .then(onPrint)
                            .catch((error) =>
                                setShowError({
                                    show: true,
                                    header: 'Print failed',
                                    content: error.toString(),
                                })
                            )
                            .finally(() => dispatch(setPrinting(false)));
                    }
                    return setShowError({
                        show: true,
                        header: 'Already printing',
                        content: errorMessages.alreadyPrinting,
                    });
                }}
            />
        </>
    );
}
