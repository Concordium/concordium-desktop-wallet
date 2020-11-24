import { AccountAddress } from '../proto/api_pb';

export interface AccountTransaction {
  sender: AccountAddress;
  nonce: number;
  energyAmount: number;
  expiry: number;
  transactionKind: TransactionKind;
  Payload;
}

export enum TransactionKind {
  Deploy_module = 0,
  Initialize_smart_contract_instance = 1,
  Update_smart_contract_instance = 2,
  Simple_transfer = 3,
  Add_baker = 4,
  Remove_baker = 5,
  Update_baker_account = 6,
  Update_baker_sign_key = 7,
  Delegate_stake = 8,
  Undelegate_stake = 9,
  Transfer_with_schedule = 19,
} // TODO: Add all kinds (11- 18)

export enum BlockItemKind {
  AccountTransactionKind = 0,
  CredentialDeploymentKind = 1,
  UpdateInstructionKind = 2,
}

type AccountCredentialWithProofs =
  | InitialCredentialDeploymentInfo
  | CredentialDeploymentInformation;

interface InitialCredentialDeploymentInfo {
  icdiValues: InitialCredentialDeploymentValues;
  signature: IpCdiSignature;
}

interface InitialCredentialDeploymentValues {
  account: InitialCredentialAccount;
  regId: CredentialRegistrationID;
  ipId: IdentityProviderIdentity;
  policy: Policy;
}

interface CredentialDeploymentInformation {
  values: CredentialDeploymentValues;
  proofs: Proofs;
}

interface CredentialDeploymentValues {
  account: CredentialAccount;
  regId: CredentialRegistrationID;
  ipId: IdentityProviderIdentity;
  revocationThreshold: Threshold;
  arData; // Map AnonymityRevocationDat,
  policy: Policy;
}

interface InitialCredentialAccount {
  keys: AccountVerificationKey[]; //
  threshhold: SignatureThreshold;
}

type SignatureThreshold = number; // word8
type AccountVerificationKey = Uint8Array;

type CredentialAccount = AccountAddress | InitialCredentialAccount; // InitialCredentialAccount = new account

type AccountAddress = Uint8Array;

type CredentialRegistrationID = Uint8Array; // sized 48 bytes,  "RegIdCred GroupElement"
type IdentityProviderIdentity = number; // IP_ID word32
type Threshold = number; // Threshold word8
export interface Policy {
  validTo: YearMonth; // CredentialValidTo
  createdAt: YearMonth; // CredentialCreatedAt
  revealedAttributes; // Map.Map AttributeTag AttributeValue
}

export interface YearMonth {
  year: number; // word16,
  month: number; // word8
}

export enum AttributeTag {
  firstName = 0,
  lastName = 1,
  sex = 2,
  dob = 3,
  countryOfResidence = 4,
  nationality = 5,
  idDocType = 6,
  idDocNo = 7,
  idDocIssuer = 8,
  idDocIssuedAt = 9,
  idDocExpiresAt = 10,
  nationalIdNo = 11,
  taxIdNo = 12,
}

type IpCdiSignature = Uint8Array;
type Proofs = Uint8Array;
