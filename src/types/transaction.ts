export type TDataTypes = "image/jpeg" | "image/png" | "image/pdg" | "video/mp4";

export interface ConstructTxRequest {
  data: string;
  dataType: TDataTypes;
  rewardAddresses: string[];
  targetAddress: string;
  utxos: string[] | null;
}

export interface ConstructTxInscribeRequest {
  changeAddress: string;
  payload: string;
  payloadType: TDataTypes;
  rewardAddresses: string[];
  utxos: string[];
  mintTokenForPayload: "NoMinting" | "Minting";
}

export interface ConstructTxResponse {
  executionArn: string;
  httpStatus: number;
}

export interface RetrieveUnsignedTxRequest {
  executionArn: string;
}

export interface RetrieveUnsignedTxResponse {
  success: {
    tx: string;
    ulid: string;
    txid: string;
  };
  inProgress?: string;
}

export interface RetrieveUnsignedInscriptionTxRequest {
  executionArn: string;
}

export interface RetrieveUnsignedInscriptionTxResponse {
  success: {
    indexingTx: string;
    indexingTxId: string;
    objectUlid: string;
    shardTxs: string[];
    shardTxIds: string[];
  };
  inProgress?: string;
}



export type TSignedTx = string;

export interface PreparedUTXOs {
  executionArn: string;
  httpStatus: number;
}

export interface TSubmissionStatus {
  success: {
    onchain: "on-chain" | "not-on-chain";
    submissionTime: string;
    txid: string;
  };
}

export interface TInscriptionSubmissionStatus {
    success?: {
        allShardSubmissions: {
            shardSubmittedDataHash: string;
            shardSubmittedTxSubmittedAt: string;
            shardSubmittedTxid: string;
        }[];
        indexingTxId: string;
        notOnchain: string[];
        onchain: string[];
    };
    inProgress?: string;
}

export interface FileProgress {
  file: File;
  status:
    | "pending"
    | "constructing"
    | "unsigned"
    | "signed"
    | "submitted"
    | "confirmed"
    | "failed";
  progress: number;
  error?: string;
  txInfo?: {
    constructedTx?: ConstructTxResponse;
    unsignedTx?:
      | RetrieveUnsignedTxResponse
      | RetrieveUnsignedInscriptionTxResponse;
    signedTx?: TSignedTx;
    submittedTx?: PreparedUTXOs;
  };
}
