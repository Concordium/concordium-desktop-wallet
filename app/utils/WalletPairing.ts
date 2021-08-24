import { getWalletId, insertWallet } from '~/database/WalletDao';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getPairingPath } from '~/features/ledger/Path';
import { setCurrentWalletId } from '~/features/WalletSlice';
import { WalletType, Dispatch } from './types';

/**
 * Pairs a (hardware) wallet with the desktop wallet. If the (hardware) wallet was already
 * paired with the desktop wallet, then no changes are made to the database.
 * @param ledger the wallet device to pair with
 * @returns the id of the inserted wallet, or the already paired wallet
 */
export default async function pairWallet(
    ledger: ConcordiumLedgerClient,
    dispatch: Dispatch
): Promise<number> {
    const pairingKey = (
        await ledger.getPublicKeySilent(getPairingPath())
    ).toString('hex');
    let walletId = await getWalletId(pairingKey);
    if (walletId === undefined) {
        walletId = await insertWallet(pairingKey, WalletType.LedgerNanoS);
        dispatch(setCurrentWalletId(walletId));
    }
    return walletId;
}
