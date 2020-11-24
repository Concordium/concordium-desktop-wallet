// package: concordium
// file: api.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as api_pb from "./api_pb";
import * as google_protobuf_wrappers_pb from "google-protobuf/google/protobuf/wrappers_pb";

interface IP2PService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    peerConnect: IP2PService_IPeerConnect;
    peerUptime: IP2PService_IPeerUptime;
    peerTotalSent: IP2PService_IPeerTotalSent;
    peerTotalReceived: IP2PService_IPeerTotalReceived;
    peerVersion: IP2PService_IPeerVersion;
    peerStats: IP2PService_IPeerStats;
    peerList: IP2PService_IPeerList;
    banNode: IP2PService_IBanNode;
    unbanNode: IP2PService_IUnbanNode;
    joinNetwork: IP2PService_IJoinNetwork;
    leaveNetwork: IP2PService_ILeaveNetwork;
    nodeInfo: IP2PService_INodeInfo;
    getConsensusStatus: IP2PService_IGetConsensusStatus;
    getBlockInfo: IP2PService_IGetBlockInfo;
    getAncestors: IP2PService_IGetAncestors;
    getBranches: IP2PService_IGetBranches;
    getBlocksAtHeight: IP2PService_IGetBlocksAtHeight;
    sendTransaction: IP2PService_ISendTransaction;
    startBaker: IP2PService_IStartBaker;
    stopBaker: IP2PService_IStopBaker;
    getAccountList: IP2PService_IGetAccountList;
    getInstances: IP2PService_IGetInstances;
    getAccountInfo: IP2PService_IGetAccountInfo;
    getInstanceInfo: IP2PService_IGetInstanceInfo;
    getRewardStatus: IP2PService_IGetRewardStatus;
    getBirkParameters: IP2PService_IGetBirkParameters;
    getModuleList: IP2PService_IGetModuleList;
    getModuleSource: IP2PService_IGetModuleSource;
    getIdentityProviders: IP2PService_IGetIdentityProviders;
    getAnonymityRevokers: IP2PService_IGetAnonymityRevokers;
    getBannedPeers: IP2PService_IGetBannedPeers;
    shutdown: IP2PService_IShutdown;
    dumpStart: IP2PService_IDumpStart;
    dumpStop: IP2PService_IDumpStop;
    getTransactionStatus: IP2PService_IGetTransactionStatus;
    getTransactionStatusInBlock: IP2PService_IGetTransactionStatusInBlock;
    getAccountNonFinalizedTransactions: IP2PService_IGetAccountNonFinalizedTransactions;
    getBlockSummary: IP2PService_IGetBlockSummary;
    getNextAccountNonce: IP2PService_IGetNextAccountNonce;
}

interface IP2PService_IPeerConnect extends grpc.MethodDefinition<api_pb.PeerConnectRequest, api_pb.BoolResponse> {
    path: "/concordium.P2P/PeerConnect";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.PeerConnectRequest>;
    requestDeserialize: grpc.deserialize<api_pb.PeerConnectRequest>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_IPeerUptime extends grpc.MethodDefinition<api_pb.Empty, api_pb.NumberResponse> {
    path: "/concordium.P2P/PeerUptime";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.NumberResponse>;
    responseDeserialize: grpc.deserialize<api_pb.NumberResponse>;
}
interface IP2PService_IPeerTotalSent extends grpc.MethodDefinition<api_pb.Empty, api_pb.NumberResponse> {
    path: "/concordium.P2P/PeerTotalSent";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.NumberResponse>;
    responseDeserialize: grpc.deserialize<api_pb.NumberResponse>;
}
interface IP2PService_IPeerTotalReceived extends grpc.MethodDefinition<api_pb.Empty, api_pb.NumberResponse> {
    path: "/concordium.P2P/PeerTotalReceived";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.NumberResponse>;
    responseDeserialize: grpc.deserialize<api_pb.NumberResponse>;
}
interface IP2PService_IPeerVersion extends grpc.MethodDefinition<api_pb.Empty, api_pb.StringResponse> {
    path: "/concordium.P2P/PeerVersion";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.StringResponse>;
    responseDeserialize: grpc.deserialize<api_pb.StringResponse>;
}
interface IP2PService_IPeerStats extends grpc.MethodDefinition<api_pb.PeersRequest, api_pb.PeerStatsResponse> {
    path: "/concordium.P2P/PeerStats";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.PeersRequest>;
    requestDeserialize: grpc.deserialize<api_pb.PeersRequest>;
    responseSerialize: grpc.serialize<api_pb.PeerStatsResponse>;
    responseDeserialize: grpc.deserialize<api_pb.PeerStatsResponse>;
}
interface IP2PService_IPeerList extends grpc.MethodDefinition<api_pb.PeersRequest, api_pb.PeerListResponse> {
    path: "/concordium.P2P/PeerList";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.PeersRequest>;
    requestDeserialize: grpc.deserialize<api_pb.PeersRequest>;
    responseSerialize: grpc.serialize<api_pb.PeerListResponse>;
    responseDeserialize: grpc.deserialize<api_pb.PeerListResponse>;
}
interface IP2PService_IBanNode extends grpc.MethodDefinition<api_pb.PeerElement, api_pb.BoolResponse> {
    path: "/concordium.P2P/BanNode";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.PeerElement>;
    requestDeserialize: grpc.deserialize<api_pb.PeerElement>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_IUnbanNode extends grpc.MethodDefinition<api_pb.PeerElement, api_pb.BoolResponse> {
    path: "/concordium.P2P/UnbanNode";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.PeerElement>;
    requestDeserialize: grpc.deserialize<api_pb.PeerElement>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_IJoinNetwork extends grpc.MethodDefinition<api_pb.NetworkChangeRequest, api_pb.BoolResponse> {
    path: "/concordium.P2P/JoinNetwork";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.NetworkChangeRequest>;
    requestDeserialize: grpc.deserialize<api_pb.NetworkChangeRequest>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_ILeaveNetwork extends grpc.MethodDefinition<api_pb.NetworkChangeRequest, api_pb.BoolResponse> {
    path: "/concordium.P2P/LeaveNetwork";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.NetworkChangeRequest>;
    requestDeserialize: grpc.deserialize<api_pb.NetworkChangeRequest>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_INodeInfo extends grpc.MethodDefinition<api_pb.Empty, api_pb.NodeInfoResponse> {
    path: "/concordium.P2P/NodeInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.NodeInfoResponse>;
    responseDeserialize: grpc.deserialize<api_pb.NodeInfoResponse>;
}
interface IP2PService_IGetConsensusStatus extends grpc.MethodDefinition<api_pb.Empty, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetConsensusStatus";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetBlockInfo extends grpc.MethodDefinition<api_pb.BlockHash, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetBlockInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHash>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHash>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetAncestors extends grpc.MethodDefinition<api_pb.BlockHashAndAmount, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetAncestors";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHashAndAmount>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHashAndAmount>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetBranches extends grpc.MethodDefinition<api_pb.Empty, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetBranches";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetBlocksAtHeight extends grpc.MethodDefinition<api_pb.BlockHeight, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetBlocksAtHeight";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHeight>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHeight>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_ISendTransaction extends grpc.MethodDefinition<api_pb.SendTransactionRequest, api_pb.BoolResponse> {
    path: "/concordium.P2P/SendTransaction";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.SendTransactionRequest>;
    requestDeserialize: grpc.deserialize<api_pb.SendTransactionRequest>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_IStartBaker extends grpc.MethodDefinition<api_pb.Empty, api_pb.BoolResponse> {
    path: "/concordium.P2P/StartBaker";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_IStopBaker extends grpc.MethodDefinition<api_pb.Empty, api_pb.BoolResponse> {
    path: "/concordium.P2P/StopBaker";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_IGetAccountList extends grpc.MethodDefinition<api_pb.BlockHash, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetAccountList";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHash>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHash>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetInstances extends grpc.MethodDefinition<api_pb.BlockHash, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetInstances";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHash>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHash>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetAccountInfo extends grpc.MethodDefinition<api_pb.GetAddressInfoRequest, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetAccountInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.GetAddressInfoRequest>;
    requestDeserialize: grpc.deserialize<api_pb.GetAddressInfoRequest>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetInstanceInfo extends grpc.MethodDefinition<api_pb.GetAddressInfoRequest, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetInstanceInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.GetAddressInfoRequest>;
    requestDeserialize: grpc.deserialize<api_pb.GetAddressInfoRequest>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetRewardStatus extends grpc.MethodDefinition<api_pb.BlockHash, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetRewardStatus";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHash>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHash>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetBirkParameters extends grpc.MethodDefinition<api_pb.BlockHash, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetBirkParameters";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHash>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHash>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetModuleList extends grpc.MethodDefinition<api_pb.BlockHash, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetModuleList";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHash>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHash>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetModuleSource extends grpc.MethodDefinition<api_pb.GetModuleSourceRequest, api_pb.BytesResponse> {
    path: "/concordium.P2P/GetModuleSource";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.GetModuleSourceRequest>;
    requestDeserialize: grpc.deserialize<api_pb.GetModuleSourceRequest>;
    responseSerialize: grpc.serialize<api_pb.BytesResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BytesResponse>;
}
interface IP2PService_IGetIdentityProviders extends grpc.MethodDefinition<api_pb.BlockHash, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetIdentityProviders";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHash>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHash>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetAnonymityRevokers extends grpc.MethodDefinition<api_pb.BlockHash, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetAnonymityRevokers";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHash>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHash>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetBannedPeers extends grpc.MethodDefinition<api_pb.Empty, api_pb.PeerListResponse> {
    path: "/concordium.P2P/GetBannedPeers";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.PeerListResponse>;
    responseDeserialize: grpc.deserialize<api_pb.PeerListResponse>;
}
interface IP2PService_IShutdown extends grpc.MethodDefinition<api_pb.Empty, api_pb.BoolResponse> {
    path: "/concordium.P2P/Shutdown";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_IDumpStart extends grpc.MethodDefinition<api_pb.DumpRequest, api_pb.BoolResponse> {
    path: "/concordium.P2P/DumpStart";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.DumpRequest>;
    requestDeserialize: grpc.deserialize<api_pb.DumpRequest>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_IDumpStop extends grpc.MethodDefinition<api_pb.Empty, api_pb.BoolResponse> {
    path: "/concordium.P2P/DumpStop";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.Empty>;
    requestDeserialize: grpc.deserialize<api_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.BoolResponse>;
    responseDeserialize: grpc.deserialize<api_pb.BoolResponse>;
}
interface IP2PService_IGetTransactionStatus extends grpc.MethodDefinition<api_pb.TransactionHash, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetTransactionStatus";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.TransactionHash>;
    requestDeserialize: grpc.deserialize<api_pb.TransactionHash>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetTransactionStatusInBlock extends grpc.MethodDefinition<api_pb.GetTransactionStatusInBlockRequest, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetTransactionStatusInBlock";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.GetTransactionStatusInBlockRequest>;
    requestDeserialize: grpc.deserialize<api_pb.GetTransactionStatusInBlockRequest>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetAccountNonFinalizedTransactions extends grpc.MethodDefinition<api_pb.AccountAddress, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetAccountNonFinalizedTransactions";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.AccountAddress>;
    requestDeserialize: grpc.deserialize<api_pb.AccountAddress>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetBlockSummary extends grpc.MethodDefinition<api_pb.BlockHash, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetBlockSummary";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.BlockHash>;
    requestDeserialize: grpc.deserialize<api_pb.BlockHash>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}
interface IP2PService_IGetNextAccountNonce extends grpc.MethodDefinition<api_pb.AccountAddress, api_pb.JsonResponse> {
    path: "/concordium.P2P/GetNextAccountNonce";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.AccountAddress>;
    requestDeserialize: grpc.deserialize<api_pb.AccountAddress>;
    responseSerialize: grpc.serialize<api_pb.JsonResponse>;
    responseDeserialize: grpc.deserialize<api_pb.JsonResponse>;
}

export const P2PService: IP2PService;

export interface IP2PServer {
    peerConnect: grpc.handleUnaryCall<api_pb.PeerConnectRequest, api_pb.BoolResponse>;
    peerUptime: grpc.handleUnaryCall<api_pb.Empty, api_pb.NumberResponse>;
    peerTotalSent: grpc.handleUnaryCall<api_pb.Empty, api_pb.NumberResponse>;
    peerTotalReceived: grpc.handleUnaryCall<api_pb.Empty, api_pb.NumberResponse>;
    peerVersion: grpc.handleUnaryCall<api_pb.Empty, api_pb.StringResponse>;
    peerStats: grpc.handleUnaryCall<api_pb.PeersRequest, api_pb.PeerStatsResponse>;
    peerList: grpc.handleUnaryCall<api_pb.PeersRequest, api_pb.PeerListResponse>;
    banNode: grpc.handleUnaryCall<api_pb.PeerElement, api_pb.BoolResponse>;
    unbanNode: grpc.handleUnaryCall<api_pb.PeerElement, api_pb.BoolResponse>;
    joinNetwork: grpc.handleUnaryCall<api_pb.NetworkChangeRequest, api_pb.BoolResponse>;
    leaveNetwork: grpc.handleUnaryCall<api_pb.NetworkChangeRequest, api_pb.BoolResponse>;
    nodeInfo: grpc.handleUnaryCall<api_pb.Empty, api_pb.NodeInfoResponse>;
    getConsensusStatus: grpc.handleUnaryCall<api_pb.Empty, api_pb.JsonResponse>;
    getBlockInfo: grpc.handleUnaryCall<api_pb.BlockHash, api_pb.JsonResponse>;
    getAncestors: grpc.handleUnaryCall<api_pb.BlockHashAndAmount, api_pb.JsonResponse>;
    getBranches: grpc.handleUnaryCall<api_pb.Empty, api_pb.JsonResponse>;
    getBlocksAtHeight: grpc.handleUnaryCall<api_pb.BlockHeight, api_pb.JsonResponse>;
    sendTransaction: grpc.handleUnaryCall<api_pb.SendTransactionRequest, api_pb.BoolResponse>;
    startBaker: grpc.handleUnaryCall<api_pb.Empty, api_pb.BoolResponse>;
    stopBaker: grpc.handleUnaryCall<api_pb.Empty, api_pb.BoolResponse>;
    getAccountList: grpc.handleUnaryCall<api_pb.BlockHash, api_pb.JsonResponse>;
    getInstances: grpc.handleUnaryCall<api_pb.BlockHash, api_pb.JsonResponse>;
    getAccountInfo: grpc.handleUnaryCall<api_pb.GetAddressInfoRequest, api_pb.JsonResponse>;
    getInstanceInfo: grpc.handleUnaryCall<api_pb.GetAddressInfoRequest, api_pb.JsonResponse>;
    getRewardStatus: grpc.handleUnaryCall<api_pb.BlockHash, api_pb.JsonResponse>;
    getBirkParameters: grpc.handleUnaryCall<api_pb.BlockHash, api_pb.JsonResponse>;
    getModuleList: grpc.handleUnaryCall<api_pb.BlockHash, api_pb.JsonResponse>;
    getModuleSource: grpc.handleUnaryCall<api_pb.GetModuleSourceRequest, api_pb.BytesResponse>;
    getIdentityProviders: grpc.handleUnaryCall<api_pb.BlockHash, api_pb.JsonResponse>;
    getAnonymityRevokers: grpc.handleUnaryCall<api_pb.BlockHash, api_pb.JsonResponse>;
    getBannedPeers: grpc.handleUnaryCall<api_pb.Empty, api_pb.PeerListResponse>;
    shutdown: grpc.handleUnaryCall<api_pb.Empty, api_pb.BoolResponse>;
    dumpStart: grpc.handleUnaryCall<api_pb.DumpRequest, api_pb.BoolResponse>;
    dumpStop: grpc.handleUnaryCall<api_pb.Empty, api_pb.BoolResponse>;
    getTransactionStatus: grpc.handleUnaryCall<api_pb.TransactionHash, api_pb.JsonResponse>;
    getTransactionStatusInBlock: grpc.handleUnaryCall<api_pb.GetTransactionStatusInBlockRequest, api_pb.JsonResponse>;
    getAccountNonFinalizedTransactions: grpc.handleUnaryCall<api_pb.AccountAddress, api_pb.JsonResponse>;
    getBlockSummary: grpc.handleUnaryCall<api_pb.BlockHash, api_pb.JsonResponse>;
    getNextAccountNonce: grpc.handleUnaryCall<api_pb.AccountAddress, api_pb.JsonResponse>;
}

export interface IP2PClient {
    peerConnect(request: api_pb.PeerConnectRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    peerConnect(request: api_pb.PeerConnectRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    peerConnect(request: api_pb.PeerConnectRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    peerUptime(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    peerUptime(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    peerUptime(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    peerTotalSent(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    peerTotalSent(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    peerTotalSent(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    peerTotalReceived(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    peerTotalReceived(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    peerTotalReceived(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    peerVersion(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.StringResponse) => void): grpc.ClientUnaryCall;
    peerVersion(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.StringResponse) => void): grpc.ClientUnaryCall;
    peerVersion(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.StringResponse) => void): grpc.ClientUnaryCall;
    peerStats(request: api_pb.PeersRequest, callback: (error: grpc.ServiceError | null, response: api_pb.PeerStatsResponse) => void): grpc.ClientUnaryCall;
    peerStats(request: api_pb.PeersRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.PeerStatsResponse) => void): grpc.ClientUnaryCall;
    peerStats(request: api_pb.PeersRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.PeerStatsResponse) => void): grpc.ClientUnaryCall;
    peerList(request: api_pb.PeersRequest, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    peerList(request: api_pb.PeersRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    peerList(request: api_pb.PeersRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    banNode(request: api_pb.PeerElement, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    banNode(request: api_pb.PeerElement, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    banNode(request: api_pb.PeerElement, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    unbanNode(request: api_pb.PeerElement, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    unbanNode(request: api_pb.PeerElement, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    unbanNode(request: api_pb.PeerElement, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    joinNetwork(request: api_pb.NetworkChangeRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    joinNetwork(request: api_pb.NetworkChangeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    joinNetwork(request: api_pb.NetworkChangeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    leaveNetwork(request: api_pb.NetworkChangeRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    leaveNetwork(request: api_pb.NetworkChangeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    leaveNetwork(request: api_pb.NetworkChangeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    nodeInfo(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.NodeInfoResponse) => void): grpc.ClientUnaryCall;
    nodeInfo(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.NodeInfoResponse) => void): grpc.ClientUnaryCall;
    nodeInfo(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.NodeInfoResponse) => void): grpc.ClientUnaryCall;
    getConsensusStatus(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getConsensusStatus(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getConsensusStatus(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBlockInfo(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBlockInfo(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBlockInfo(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAncestors(request: api_pb.BlockHashAndAmount, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAncestors(request: api_pb.BlockHashAndAmount, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAncestors(request: api_pb.BlockHashAndAmount, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBranches(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBranches(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBranches(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBlocksAtHeight(request: api_pb.BlockHeight, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBlocksAtHeight(request: api_pb.BlockHeight, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBlocksAtHeight(request: api_pb.BlockHeight, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    sendTransaction(request: api_pb.SendTransactionRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    sendTransaction(request: api_pb.SendTransactionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    sendTransaction(request: api_pb.SendTransactionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    startBaker(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    startBaker(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    startBaker(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    stopBaker(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    stopBaker(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    stopBaker(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    getAccountList(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAccountList(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAccountList(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getInstances(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getInstances(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getInstances(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAccountInfo(request: api_pb.GetAddressInfoRequest, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAccountInfo(request: api_pb.GetAddressInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAccountInfo(request: api_pb.GetAddressInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getInstanceInfo(request: api_pb.GetAddressInfoRequest, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getInstanceInfo(request: api_pb.GetAddressInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getInstanceInfo(request: api_pb.GetAddressInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getRewardStatus(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getRewardStatus(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getRewardStatus(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBirkParameters(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBirkParameters(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBirkParameters(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getModuleList(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getModuleList(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getModuleList(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getModuleSource(request: api_pb.GetModuleSourceRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BytesResponse) => void): grpc.ClientUnaryCall;
    getModuleSource(request: api_pb.GetModuleSourceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BytesResponse) => void): grpc.ClientUnaryCall;
    getModuleSource(request: api_pb.GetModuleSourceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BytesResponse) => void): grpc.ClientUnaryCall;
    getIdentityProviders(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getIdentityProviders(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getIdentityProviders(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAnonymityRevokers(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAnonymityRevokers(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAnonymityRevokers(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBannedPeers(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    getBannedPeers(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    getBannedPeers(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    shutdown(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    shutdown(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    shutdown(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    dumpStart(request: api_pb.DumpRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    dumpStart(request: api_pb.DumpRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    dumpStart(request: api_pb.DumpRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    dumpStop(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    dumpStop(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    dumpStop(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    getTransactionStatus(request: api_pb.TransactionHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getTransactionStatus(request: api_pb.TransactionHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getTransactionStatus(request: api_pb.TransactionHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getTransactionStatusInBlock(request: api_pb.GetTransactionStatusInBlockRequest, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getTransactionStatusInBlock(request: api_pb.GetTransactionStatusInBlockRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getTransactionStatusInBlock(request: api_pb.GetTransactionStatusInBlockRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAccountNonFinalizedTransactions(request: api_pb.AccountAddress, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAccountNonFinalizedTransactions(request: api_pb.AccountAddress, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getAccountNonFinalizedTransactions(request: api_pb.AccountAddress, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBlockSummary(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBlockSummary(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getBlockSummary(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getNextAccountNonce(request: api_pb.AccountAddress, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getNextAccountNonce(request: api_pb.AccountAddress, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    getNextAccountNonce(request: api_pb.AccountAddress, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
}

export class P2PClient extends grpc.Client implements IP2PClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public peerConnect(request: api_pb.PeerConnectRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public peerConnect(request: api_pb.PeerConnectRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public peerConnect(request: api_pb.PeerConnectRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public peerUptime(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    public peerUptime(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    public peerUptime(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    public peerTotalSent(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    public peerTotalSent(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    public peerTotalSent(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    public peerTotalReceived(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    public peerTotalReceived(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    public peerTotalReceived(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.NumberResponse) => void): grpc.ClientUnaryCall;
    public peerVersion(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.StringResponse) => void): grpc.ClientUnaryCall;
    public peerVersion(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.StringResponse) => void): grpc.ClientUnaryCall;
    public peerVersion(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.StringResponse) => void): grpc.ClientUnaryCall;
    public peerStats(request: api_pb.PeersRequest, callback: (error: grpc.ServiceError | null, response: api_pb.PeerStatsResponse) => void): grpc.ClientUnaryCall;
    public peerStats(request: api_pb.PeersRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.PeerStatsResponse) => void): grpc.ClientUnaryCall;
    public peerStats(request: api_pb.PeersRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.PeerStatsResponse) => void): grpc.ClientUnaryCall;
    public peerList(request: api_pb.PeersRequest, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    public peerList(request: api_pb.PeersRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    public peerList(request: api_pb.PeersRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    public banNode(request: api_pb.PeerElement, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public banNode(request: api_pb.PeerElement, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public banNode(request: api_pb.PeerElement, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public unbanNode(request: api_pb.PeerElement, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public unbanNode(request: api_pb.PeerElement, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public unbanNode(request: api_pb.PeerElement, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public joinNetwork(request: api_pb.NetworkChangeRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public joinNetwork(request: api_pb.NetworkChangeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public joinNetwork(request: api_pb.NetworkChangeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public leaveNetwork(request: api_pb.NetworkChangeRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public leaveNetwork(request: api_pb.NetworkChangeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public leaveNetwork(request: api_pb.NetworkChangeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public nodeInfo(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.NodeInfoResponse) => void): grpc.ClientUnaryCall;
    public nodeInfo(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.NodeInfoResponse) => void): grpc.ClientUnaryCall;
    public nodeInfo(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.NodeInfoResponse) => void): grpc.ClientUnaryCall;
    public getConsensusStatus(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getConsensusStatus(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getConsensusStatus(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBlockInfo(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBlockInfo(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBlockInfo(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAncestors(request: api_pb.BlockHashAndAmount, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAncestors(request: api_pb.BlockHashAndAmount, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAncestors(request: api_pb.BlockHashAndAmount, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBranches(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBranches(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBranches(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBlocksAtHeight(request: api_pb.BlockHeight, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBlocksAtHeight(request: api_pb.BlockHeight, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBlocksAtHeight(request: api_pb.BlockHeight, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public sendTransaction(request: api_pb.SendTransactionRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public sendTransaction(request: api_pb.SendTransactionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public sendTransaction(request: api_pb.SendTransactionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public startBaker(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public startBaker(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public startBaker(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public stopBaker(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public stopBaker(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public stopBaker(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public getAccountList(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAccountList(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAccountList(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getInstances(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getInstances(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getInstances(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAccountInfo(request: api_pb.GetAddressInfoRequest, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAccountInfo(request: api_pb.GetAddressInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAccountInfo(request: api_pb.GetAddressInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getInstanceInfo(request: api_pb.GetAddressInfoRequest, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getInstanceInfo(request: api_pb.GetAddressInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getInstanceInfo(request: api_pb.GetAddressInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getRewardStatus(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getRewardStatus(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getRewardStatus(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBirkParameters(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBirkParameters(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBirkParameters(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getModuleList(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getModuleList(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getModuleList(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getModuleSource(request: api_pb.GetModuleSourceRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BytesResponse) => void): grpc.ClientUnaryCall;
    public getModuleSource(request: api_pb.GetModuleSourceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BytesResponse) => void): grpc.ClientUnaryCall;
    public getModuleSource(request: api_pb.GetModuleSourceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BytesResponse) => void): grpc.ClientUnaryCall;
    public getIdentityProviders(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getIdentityProviders(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getIdentityProviders(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAnonymityRevokers(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAnonymityRevokers(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAnonymityRevokers(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBannedPeers(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    public getBannedPeers(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    public getBannedPeers(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.PeerListResponse) => void): grpc.ClientUnaryCall;
    public shutdown(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public shutdown(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public shutdown(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public dumpStart(request: api_pb.DumpRequest, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public dumpStart(request: api_pb.DumpRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public dumpStart(request: api_pb.DumpRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public dumpStop(request: api_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public dumpStop(request: api_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public dumpStop(request: api_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.BoolResponse) => void): grpc.ClientUnaryCall;
    public getTransactionStatus(request: api_pb.TransactionHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getTransactionStatus(request: api_pb.TransactionHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getTransactionStatus(request: api_pb.TransactionHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getTransactionStatusInBlock(request: api_pb.GetTransactionStatusInBlockRequest, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getTransactionStatusInBlock(request: api_pb.GetTransactionStatusInBlockRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getTransactionStatusInBlock(request: api_pb.GetTransactionStatusInBlockRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAccountNonFinalizedTransactions(request: api_pb.AccountAddress, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAccountNonFinalizedTransactions(request: api_pb.AccountAddress, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getAccountNonFinalizedTransactions(request: api_pb.AccountAddress, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBlockSummary(request: api_pb.BlockHash, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBlockSummary(request: api_pb.BlockHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getBlockSummary(request: api_pb.BlockHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getNextAccountNonce(request: api_pb.AccountAddress, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getNextAccountNonce(request: api_pb.AccountAddress, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
    public getNextAccountNonce(request: api_pb.AccountAddress, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.JsonResponse) => void): grpc.ClientUnaryCall;
}
