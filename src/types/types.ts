// General Types
export type HexString = string;
export type Bech32String = string;
export type Base64String = string;
export type ULIDString = string;
export type TTx = string;
export type TDataTypes =
  | "image/jpeg"
  | "image/png"
  | "image/pdg"
  | "video/mp4"
  | "text/plain";
export type TSignedTx = string;
// Schemas
export interface AnyTxId {
  description: string; // Transaction ID
  format: HexString;
}

export interface CborUTxO {
  description: string; // Hex-encoded CBOR representation of UTxO
  format: HexString;
}

export type HashStakeKey = string;

export interface PreparationTx {
  tx: string;
  ulid: ULIDString;
}

export interface PreparationTxSubmissionChainStatus {
  onchain: "on-chain" | "not-on-chain";
  submissionTime: string; // ISO8601 Date
  txid: HexString;
}

export interface PurchaseAndPrepareUTxOs {
  data: Base64String; // Base64 encoded
  dataType: TDataTypes; // Example: jpeg, pdf, etc.
  stakeKeyHashes: HashStakeKey[];
  targetAddress: Bech32String; // Bech32 encoded address
  utxos: HexString;
}

export interface ShardSubmitted {
  shardSubmittedDataHash: string;
  shardSubmittedTxSubmittedAt: string; // ISO8601 Date
  shardSubmittedTxid: HexString;
}

export interface SubmitInscriptionTxs {
  indexingTxToSubmit: Base64String;
  txsToSubmit: TxConwayEra[];
  ulidOfObject: ULIDString;
}

export type TxConwayEra = Base64String;

export type UnsignedTx = Base64String;

export type TTargetAddress = Bech32String;

export interface UserWalletInfo {
  data: string; // Base64 encoded;
  dataType: TDataTypes;
  stakeKeyHashes: HashStakeKey[];
  targetAddress: TTargetAddress;
  utxos: string;
}

// Security
export interface ApiKeyAuth {
  description: string;
  in: "header";
  name: "x-api-key";
  type: "apiKey";
}

// Endpoints Request and Response Types
export type ConstructTxRequest = UserWalletInfo;
export type ConstructTxResponse = PreparedUTXOs;

export type RetrieveSubmissionStatusRequest = TExecutionArn;

export type RetrieveUnsignedTxRequest = TExecutionArn;
export type RetrieveUnsignedTxResponse = TUnsignedTx;

export type SubmitInscriptionTxsRequest = SubmitInscriptionTxs;
export type SubmitInscriptionTxsResponse = PreparedUTXOs;

export type PrepareUTxOsConstructTxRequest = PurchaseAndPrepareUTxOs;
export type PrepareUTxOsConstructTxResponse = PreparedUTXOs;

export type RetrievePreparationStatusRequest = PreparedUTXOs;
export type RetrievePreparationStatusResponse =
  PreparationTxSubmissionChainStatus;

export type RetrievePreparationUnsignedTxRequest = PreparedUTXOs;
export type RetrievePreparationUnsignedTxResponse = PreparationTx;

export type SubmitPreparationTxRequest = PreparationTx;
export type SubmitPreparationTxResponse = PreparedUTXOs;

//NEW TYPES
export type TExecutionArn = string;
export type PreparedUTXOs = {
  executionArn: TExecutionArn;
  httpStatus: number;
};

export type TUnsignedTx = {
  success: {
    tx: TTx;
    ulid: string;
  };
};

export type TSubmissionStatus = {
  onchain: "on-chain" | "not-on-chain";
  submissionTime: string;
  txid: string;
};
