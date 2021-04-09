import { createContext } from 'react';
import { UseFormMethods } from 'react-hook-form';
import { DateParts } from '~/utils/timeHelpers';

interface InputTimestampContextModel
    extends UseFormMethods<Partial<DateParts>> {
    setIsFocused: (v: boolean) => void;
    fireOnChange: () => void;
}

export default createContext<InputTimestampContextModel>(
    {} as InputTimestampContextModel
);
