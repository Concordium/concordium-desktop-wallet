import { Buffer } from 'buffer/';

const validSubtrees = [0, 1, 2];

const concordiumPurpose = 1105;
const concordiumCoinType = 0;

export interface AccountPathInput {
    identityIndex: number;
    accountIndex: number;
    signatureIndex: number;
}

export interface GovernancePathInput {
    purpose: number;
    keyIndex: number;
}

/**
 * Constructs a path to an account signature key. The account key derivation path structure
 * is given by:
 *
 *  - m/purpose'/coin_type'/0'/0'/identity'/2'/account_index'/sig_index'/
 * @param identity index of the identity
 * @param accountIndex index of the account
 * @param signatureIndex index of the signature key
 */
export function getAccountPath(accountPath: AccountPathInput): number[] {
    return [
        0,
        0,
        accountPath.identityIndex,
        2,
        accountPath.accountIndex,
        accountPath.signatureIndex,
    ];
}

/**
 * Constructs the path for the public-key that is used to pair a hardware
 * wallet with the desktop wallet. The path used is the root path of the
 * derivation scheme used.
 *
 * - m/purpose'/coin_type'/
 *
 * Note that this results in an empty path, as the purpose and coin_type
 * are globally defined and automatically inserted when serializing the path.
 *
 * @returns the derivation path used to retrieve the public-key used for pairing
 * the hardware wallet with the desktop wallet.
 */
export function getPairingPath(): number[] {
    return [];
}

/**
 * Constructs a path to a governance signature key. The governance key derivation path structure
 * is given by:
 *
 *  - m/purpose'/coin_type'/1'/gov_purpose’/key_index'/
 * @param governancePath
 */
export function getGovernancePath(governancePath: GovernancePathInput) {
    return [1, governancePath.purpose, governancePath.keyIndex];
}

/**
 * Constructs the root governance key path.
 */
export function getGovernanceRootPath() {
    return getGovernancePath({ purpose: 0, keyIndex: 0 });
}

/**
 * Constructs the level 1 governance key path.
 */
export function getGovernanceLevel1Path() {
    return getGovernancePath({ purpose: 1, keyIndex: 0 });
}

/**
 * Constructs the level 2 governance key path.
 */
export function getGovernanceLevel2Path() {
    return getGovernancePath({ purpose: 2, keyIndex: 0 });
}

/**
 * Constructs a Buffer containing the key derivation path in serialized form.
 * @param keyDerivationPath the key derivation path to get as bytes in a buffer.
 */
export default function pathAsBuffer(keyDerivationPath: number[]): Buffer {
    const buffer = Buffer.alloc(1 + (2 + keyDerivationPath.length) * 4);

    const subtree = keyDerivationPath[0];
    if (subtree !== undefined && validSubtrees.indexOf(subtree) === -1) {
        throw new Error(`An invalid subtree was provided: ${subtree}`);
    }

    // Governance subtree has a depth of exactly 3.
    if (subtree === 1 && keyDerivationPath.length !== 3) {
        throw new Error(
            `A governance derivation path was supplied, but the path does not have length 3: ${keyDerivationPath.length}`
        );
    }

    // Pre-fix with the length of the incoming path.
    buffer[0] = keyDerivationPath.length + 2;

    // Purpose and coin type are not user input, but statically defined for all paths.
    buffer.writeInt32BE(concordiumPurpose, 1);
    buffer.writeInt32BE(concordiumCoinType, 5);

    let pathOffset = 9;
    keyDerivationPath.forEach((element) => {
        buffer.writeInt32BE(element, pathOffset);
        pathOffset += 4;
    });
    return buffer;
}
