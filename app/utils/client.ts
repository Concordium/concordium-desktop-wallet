import grpc from 'grpc';
import services from '../proto/api_grpc_pb';
import  { BlockHash, JSONResponse }  from '../proto/api_pb';

const port = 10000;
const client =  new services.P2PClient(`localhost:${port}`, grpc.credentials.createInsecure());
function getMetaData(): MetaData {
    const meta = new grpc.Metadata();
    meta.add('authentication', 'rpcadmin');
    return meta;
}

export function getBlockSummary(blockHashValue: String): Promise<JSONResponse> {
    return new Promise<JSONResponse>((resolve, reject) => {

        const blockHash = new BlockHash();
        blockHash.setBlockHash(blockHashValue);

        client.getBlockSummary(blockHash, getMetaData() , (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        });
    });
}
