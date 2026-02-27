/* tslint:disable */
/* eslint-disable */
export function createTransferToEncryptedData(input: string, prf_key_raw: string, use_deprecated: boolean): string;
export function decrypt_amounts_ext(input: string, prf_key_raw: string, use_deprecated: boolean): string;
export function createEncryptedTransferData(input: string, prf_key_raw: string, use_deprecated: boolean): string;
export function buildPublicInformationForIp(input: string, id_cred_sec_seed: string, prf_key_seed: string): string;
export function createGenesisAccount(input: string, id_cred_sec_raw: string, prf_key_raw: string): string;
export function generateUnsignedCredential(input: string, id_cred_sec_raw: string, prf_key_raw: string, use_deprecated: boolean): string;
export function generateBakerKeys(sender: string, key_variant: BakerKeyVariant): string;
export function getCredId(prf_key_seed: string, cred_counter: number, global_context: string, use_deprecated: boolean): string;
export function getDeploymentInfo(signature: string, unsigned_info: string): string;
export function getAddressFromCredId(cred_id: string): string;
export function getDeploymentDetails(signature: string, unsigned_info: string, expiry: bigint): string;
export function createTransferToPublicData(input: string, prf_key_raw: string, use_deprecated: boolean): string;
export function createIdRequest(input: string, signature: string, id_cred_sec_seed: string, prf_key_seed: string): string;
export enum BakerKeyVariant {
  ADD = 0,
  UPDATE = 1,
  CONFIGURE = 2,
}
