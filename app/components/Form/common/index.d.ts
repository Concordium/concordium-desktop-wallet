export interface CommonFieldProps {
    /**
     * @description
     * Message to show if field is invalid. If this is anything other than 'undefined', the field is assumed invalid.
     */
    error?: string;
    isInvalid?: boolean;
    name?: string;
}

export interface CommonInputProps extends CommonFieldProps {
    label?: string | JSX.Element;
}
