import React, { useRef, useState, PropsWithChildren } from 'react';
import ReactToPrint from 'react-to-print';
import PrinterIcon from '@resources/svg/printer.svg';
import printContent from '~/utils/printContent';
import IconButton from '~/cross-app-components/IconButton';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import styles from './PrintButton.module.scss';

interface Props {
    className?: string;
    printClassName?: string;
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
    printClassName,
    children,
}: PropsWithChildren<Props>) {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const componentRef = useRef(null);

    return (
        <>
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
            <div className={styles.hidden}>
                <div className={printClassName} ref={componentRef}>
                    {children}
                </div>
            </div>
            <ReactToPrint
                trigger={() => (
                    <IconButton className={className}>
                        <PrinterIcon height="20" />
                    </IconButton>
                )}
                content={() => componentRef.current || null}
                print={(htmlContentToPrint) =>
                    printContent(htmlContentToPrint).catch((error) =>
                        setShowError({
                            show: true,
                            header: 'Print Failed',
                            content: error,
                        })
                    )
                }
            />
        </>
    );
}
