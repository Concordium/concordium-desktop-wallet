export const minDate = (min: Date, message?: string) => (v: Date) => {
    return v > min ? true : message || false;
};

export const maxDate = (max: Date, message?: string) => (v: Date) => {
    return v < max ? true : message || false;
};

export const futureDate = (message?: string) => minDate(new Date(), message);
