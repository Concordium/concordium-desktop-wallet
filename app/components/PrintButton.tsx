import React, { useState, RefObject, ReactInstance } from 'react';
import ReactToPrint from 'react-to-print';
import PrinterIcon from '@resources/svg/printer.svg';
import printContent from '~/utils/printContent';
import IconButton from '~/cross-app-components/IconButton';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';

interface Props<T> {
    componentRef: RefObject<T | undefined>;
    className?: string;
}
/**
 * A button which onclick prints the referenced component.
 *
 * @example
 * <PrintButton componentRef={componentRef}/>
 */
export default function PrintButton<T extends ReactInstance>({
    componentRef,
    className,
}: Props<T>) {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });

    return (
        <>
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
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
