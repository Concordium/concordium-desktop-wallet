import bs58check from 'bs58check';

// Given a string, checks if it is a valid bs58check address.
// TODO: check length?
export function isValidAddress(address: string): boolean {
    try {
        if (!address) {
            return false;
        }
        bs58check.decode(address); // This function should throw an error if input has an invalid checksum.x
    } catch (e) {
        return false;
    }
    return true;
}

export const dummy = 0;
