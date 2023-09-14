// eslint-disable-next-line import/prefer-default-export
export const hasDelegationProtocol = (pv: bigint) => pv >= 4n;

export const hasConsensusUpdateProtocol = (pv: bigint) => pv >= 6n;
