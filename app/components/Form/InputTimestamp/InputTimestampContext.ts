import { createContext } from 'react';
import { UseFormMethods } from 'react-hook-form';
import { DateParts } from './util';

interface InputTimestampContextModel
    extends UseFormMethods<Partial<DateParts>> {
    setIsFocused: (v: boolean) => void;
    fireOnChange: () => void;
}

export default createContext<InputTimestampContextModel>(
    {} as InputTimestampContextModel
);
