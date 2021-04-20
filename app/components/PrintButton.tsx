import React, { RefObject, ReactInstance } from 'react';
import ReactToPrint from 'react-to-print';
import PrinterIcon from '@resources/svg/printer.svg';
import printContent from '~/utils/printContent';
import IconButton from '~/cross-app-components/IconButton';

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
    return (
        <>
            <ReactToPrint
                trigger={() => (
                    <IconButton className={className}>
                        <PrinterIcon height="20" />
                    </IconButton>
                )}
                content={() => componentRef.current || null}
                print={(htmlContentToPrint) => {
                    return new Promise((resolve, reject) => {
                        printContent(htmlContentToPrint)
                            .then(resolve)
                            .catch(reject);
                    });
                }}
            />
        </>
    );
}
