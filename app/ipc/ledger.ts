import { IpcMain } from 'electron';
import { Buffer } from 'buffer/';
import ledgerIpcCommands from '~/constants/ledgerIpcCommands.json';
import { parse } from '~/utils/JSONHelper';
import { getLedgerClient } from '~/ledgerObserver';
import { AccountPathInput } from '~/features/ledger/Path';
import {
    AccountTransaction,
    PublicInformationForIp,
    UnsignedCredentialDeploymentInformation,
    UpdateInstruction,
    ExchangeRate,
    TransactionFeeDistribution,
    FoundationAccount,
    MintDistribution,
    ProtocolUpdate,
    GasRewards,
    BakerStakeThreshold,
    ElectionDifficulty,
    HigherLevelKeyUpdate,
    AuthorizationKeysUpdate,
    UpdateAccountCredentials,
} from '~/utils/types';

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ledgerIpcCommands.getPublicKey,
        (_event, keypath: number[]) => {
            return getLedgerClient().getPublicKey(keypath);
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.getPublicKeySilent,
        (_event, keypath: number[]) => {
            return getLedgerClient().getPublicKeySilent(keypath);
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.getSignedPublicKey,
        (_event, keypath: number[]) => {
            return getLedgerClient().getSignedPublicKey(keypath);
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.getIdCredSec,
        (_event, identity: number) => {
            return getLedgerClient().getIdCredSec(identity);
        }
    );

    ipcMain.handle(ledgerIpcCommands.getPrfKey, (_event, identity: number) => {
        return getLedgerClient().getPrfKey(identity);
    });

    ipcMain.handle(
        ledgerIpcCommands.signTransfer,
        (_event, transactionAsJson: string, keypath: number[]) => {
            const transaction: AccountTransaction = parse(transactionAsJson);
            return getLedgerClient().signTransfer(transaction, keypath);
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signPublicInformationForIp,
        (
            _event,
            publicInfoForIp: PublicInformationForIp,
            accountPathInput: AccountPathInput
        ) => {
            return getLedgerClient().signPublicInformationForIp(
                publicInfoForIp,
                accountPathInput
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signUpdateCredentialTransaction,
        (_event, transactionAsJson: string, path: number[]) => {
            const transaction: UpdateAccountCredentials = parse(
                transactionAsJson
            );
            return getLedgerClient().signUpdateCredentialTransaction(
                transaction,
                path
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signCredentialDeploymentOnExistingAccount,
        (
            _event,
            credentialDeployment: UnsignedCredentialDeploymentInformation,
            address: string,
            keypath: number[]
        ) => {
            return getLedgerClient().signCredentialDeploymentOnExistingAccount(
                credentialDeployment,
                address,
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signCredentialDeploymentOnNewAccount,
        (
            _event,
            credentialDeployment: UnsignedCredentialDeploymentInformation,
            expiry: string,
            keypath: number[]
        ) => {
            return getLedgerClient().signCredentialDeploymentOnNewAccount(
                credentialDeployment,
                parse(expiry),
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signMicroGtuPerEuro,
        (
            _event,
            transaction: UpdateInstruction<ExchangeRate>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signMicroGtuPerEuro(
                transaction,
                serializedPayload,
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signEuroPerEnergy,
        (
            _event,
            transaction: UpdateInstruction<ExchangeRate>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signEuroPerEnergy(
                transaction,
                serializedPayload,
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signTransactionFeeDistribution,
        (
            _event,
            transaction: UpdateInstruction<TransactionFeeDistribution>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signTransactionFeeDistribution(
                transaction,
                serializedPayload,
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signFoundationAccount,
        (
            _event,
            transaction: UpdateInstruction<FoundationAccount>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signFoundationAccount(
                transaction,
                serializedPayload,
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signMintDistribution,
        (
            _event,
            transaction: UpdateInstruction<MintDistribution>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signMintDistribution(
                transaction,
                serializedPayload,
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signProtocolUpdate,
        (
            _event,
            transaction: UpdateInstruction<ProtocolUpdate>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signProtocolUpdate(
                transaction,
                serializedPayload,
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signGasRewards,
        (
            _event,
            transaction: UpdateInstruction<GasRewards>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signGasRewards(
                transaction,
                serializedPayload,
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signBakerStakeThreshold,
        (
            _event,
            transaction: UpdateInstruction<BakerStakeThreshold>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signBakerStakeThreshold(
                transaction,
                serializedPayload,
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signElectionDifficulty,
        (
            _event,
            transaction: UpdateInstruction<ElectionDifficulty>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signElectionDifficulty(
                transaction,
                serializedPayload,
                keypath
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signHigherLevelKeysUpdate,
        (
            _event,
            transaction: UpdateInstruction<HigherLevelKeyUpdate>,
            serializedPayload: Buffer,
            keypath: number[],
            INS: number
        ) => {
            return getLedgerClient().signHigherLevelKeysUpdate(
                transaction,
                serializedPayload,
                keypath,
                INS
            );
        }
    );

    ipcMain.handle(
        ledgerIpcCommands.signAuthorizationKeysUpdate,
        (
            _event,
            transaction: UpdateInstruction<AuthorizationKeysUpdate>,
            serializedPayload: Buffer,
            keypath: number[],
            INS: number
        ) => {
            return getLedgerClient().signAuthorizationKeysUpdate(
                transaction,
                serializedPayload,
                keypath,
                INS
            );
        }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(ledgerIpcCommands.getAppAndVersion, (_event) => {
        return getLedgerClient().getAppAndVersion();
    });
}
