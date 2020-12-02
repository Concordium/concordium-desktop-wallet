const validSubtrees = [0, 1, 2];

// TODO[MAINNET]: A Concordium specific purpose and coin type has to be decided before mainnet.
// TODO: Probably move this into the Ledger device as we will be restricting it anyway.
const concordiumPurpose = 583;
const concordiumCoinType = 691;

/**
 * Constructs a Buffer containing the key derivation path in serialized form.
 * @param keyDerivationPath the key derivation path to get as bytes in a buffer.
 */
export default function pathAsBuffer(keyDerivationPath: number[]): Buffer {
    const buffer = Buffer.alloc(1 + (2 + keyDerivationPath.length) * 4);

    const subtree = keyDerivationPath[0];
    if (validSubtrees.indexOf(subtree) === -1) {
        throw new Error(`An invalid subtree was provided: ${subtree}`);
    }

    // Governance subtree has a depth of exactly 3 + 2.
    if (subtree === 2 && keyDerivationPath.length !== 5) {
        throw new Error(
            `A governance derivation path was supplied, but the path does not have length 5: ${keyDerivationPath.length}`
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
