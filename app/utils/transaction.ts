import { AccountAddress } from '../proto/api_pb';
import data from '../features/test/transfer.json';

export interface AccountTransaction {
  sender: AccountAddress;
  nonce: number;
  energyAmount: number;
  expiry: number;
  transactionKind: TransactionKind;
  Payload;
}

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

export enum TransactionKind {
  Deploy_module = 0,
  Initialize_smart_contract_instance = 1,
  Update_smart_contract_instance = 2,
  Simple_transfer = 3,
  Deploy_credential = 4,
  Deploy_encryption_key = 5,
  Add_baker = 6,
  Remove_baker = 7,
  Update_baker_account = 8,
  Update_baker_sign_key = 9,
  Delegate_stake = 10,
  Undelegate_stake = 11,
  Transfer_with_schedule = 19,
} // TODO: Add all kinds (12- 18)
