import data from '../features/test/transfer.json';
import cred from '../features/test/credential-payload.json';
import {
  TransactionKind,
  CredentialDeploymentInformation,
  CredentialDeploymentValues,
  InitialCredentialAccount,
  Policy,
} from './types.ts';

export function makeTestTransferWithScheduleTransaction() {
  return {
    sender: data.sender,
    nonce: data.nonce,
    energyAmount: data.energyAmount,
    expiry: data.expiry,
    transactionKind: TransactionKind.Transfer_with_schedule,
    payload: {
      toAddress: data.payload.toaddress.address,
      schedule: [
        { timestamp: 0, amount: 1 },
        { timestamp: 1, amount: 1 },
      ],
    },
  };
}

export function makeTestSimpleTransferTransaction() {
  return {
    sender: data.sender,
    nonce: data.nonce,
    energyAmount: data.energyAmount,
    expiry: data.expiry,
    transactionKind: TransactionKind.Simple_transfer,
    payload: {
      toAdress: data.payload.toaddress.address,
      amount: data.payload.amount,
    },
  };
}

export function buildCredDep(): CredentialDeploymentInformation {
  return {
    values: buildValues(cred.value),
    proofs: parseHexString(cred.value.proofs),
  };
}

function buildValues(values): CredentialDeploymentValues {
  return {
    account: buildAccount(values.account),
    regId: parseHexString(values.regId),
    ipId: values.ipIdentity,
    revocationThreshold: values.revocationThreshold,
    arData: values.arData, // Map AnonymityRevocationDat,
    policy: buildPolicy(values.policy),
  };
}

function buildAccount(account): InitialCredentialAccount {
  return {
    keys: account.keys,
    threshold: account.threshold,
  };
}

function buildPolicy(policy): Policy {
  return {
    validTo: buildYearMonth(policy.validTo),
    createdAt: buildYearMonth(policy.createdAt),
    revealedAttributes: policy.revealedAttributes,
  };
}

function buildYearMonth(yearMonth) {
  return {
    year: parseInt(yearMonth.substring(0, 4)),
    month: parseInt(yearMonth.substring(4, 6)),
  };
}

function parseHexString(hexString): Uint8Array {
  return Uint8Array.from(Buffer.from(hexString, 'hex'));
}
