import { FieldError } from 'react-hook-form';

export interface FieldCommonProps {
    error?: FieldError;
    name: string;
}
