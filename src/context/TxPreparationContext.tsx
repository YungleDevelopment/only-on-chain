"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { TWalletAPI } from "../types/cardano";
import { useWallet } from "./WalletContext";
import {
  FileProgress,
  ConstructTxRequest,
  ConstructTxResponse,
  RetrieveUnsignedTxResponse,
  PreparedUTXOs,
  TSubmissionStatus,
  TDataTypes,
} from "../types/transaction";
import { API_KEY, base64ToHex, buildApiUrl } from "../utils/apiConsumption";
import { useTxStatus } from "./TxStatusContext";

export type TxPreparationStep =
  | "prepare/construct"
  | "prepare/retrieve"
  | "prepare/submit"
  | "prepare/retrieve-submission";

interface TxPreparationContextType {
  fileProgress: FileProgress[];
  prepareFiles: (files: File[]) => Promise<void>;
  prepareText: (text: string) => Promise<void>;
  signAndSubmit: () => Promise<void>;
  isProcessing: boolean;
  currentStep: TxPreparationStep;
  nextStep: TxPreparationStep | null;
  error: string | null;
  clearError: () => void;
  reset: () => void;
  submissionStatus?: TSubmissionStatus;
  setSubmissionStatus: (status: TSubmissionStatus) => void;
  unsignedTxId: string | null;
  setUnsignedTxId: (txId: string | null) => void;
}

const TxPreparationContext = createContext<
  TxPreparationContextType | undefined
>(undefined);

export function useTxPreparation() {
  const context = useContext(TxPreparationContext);
  if (!context) {
    throw new Error(
      "useTxPreparation must be used within a TxPreparationProvider"
    );
  }
  return context;
}

export function TxPreparationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getWalletApi, defaultWallet } = useWallet();
  const { preparation, moveToNextStep } = useTxStatus();
  const [submissionStatus, setSubmissionStatus] = useState<TSubmissionStatus>();
  const [unsignedTxId, setUnsignedTxId] = useState<string | null>(null);

  const updateFileProgress = useCallback(
    (index: number, updates: Partial<FileProgress>) => {
      setFileProgress((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const constructTx = async (
    api: TWalletAPI,
    data: string,
    dataType: TDataTypes
  ): Promise<ConstructTxResponse> => {
    // Se asume que el estado inicial ("prepare/construct" y "prepare/retrieve")
    // ya se definió en TxStatusContext para la preparación.
    const rewardAddresses = (await api.getRewardAddresses()) as string[];
    const utxos = (await api.getUtxos()) || [];
    console.log("UTXOs:", utxos);
    const targetAddress = (await api.getUsedAddresses())[0];
    if (!utxos || utxos.length === 0) {
      setError("No hay UTXOs disponibles");
      throw new Error("No UTXOs available");
    }

    const body: ConstructTxRequest = {
      data,
      dataType,
      rewardAddresses,
      targetAddress,
      utxos,
    };
    console.log("Body:", body);

    const response = await fetch(buildApiUrl("/prepare-utxos/construct-tx"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData;
      try {
        const errorResponse = response.clone();
        errorData = await errorResponse.json();
      } catch (e) {
        errorData = await response.text();
      }
      throw new Error(
        JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          endpoint: "/prepare-utxos/construct-tx",
        })
      );
    }
    // Se avanza al siguiente paso en el flujo de preparación
    moveToNextStep("preparation");
    return await response.json();
  };

  const prepareFiles = async (files: File[]) => {
    if (!defaultWallet) throw new Error("No wallet connected");
    const api = getWalletApi(defaultWallet) as TWalletAPI;
    setIsProcessing(true);
    try {
      setFileProgress(
        files.map((file) => ({
          file,
          status: "pending",
          progress: 0,
        }))
      );

      for (let i = 0; i < files.length; i++) {
        updateFileProgress(i, { status: "constructing", progress: 25 });
        const reader = new FileReader();
        const fileAsBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(files[i]);
        });
        const base64Content = fileAsBase64.split(",")[1];
        const constructedTx = await constructTx(
          api,
          base64Content,
          files[i].type as TDataTypes
        );
        updateFileProgress(0, {
          status: "unsigned",
          progress: 50,
          txInfo: { constructedTx },
        });
      }
      moveToNextStep("preparation");
    } catch (error) {
      console.error("Error preparing files:", error);
      setError(error instanceof Error ? error.message : JSON.stringify(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const prepareText = async (text: string) => {
    if (!defaultWallet) throw new Error("No wallet connected");
    const api = getWalletApi(defaultWallet) as TWalletAPI;
    setIsProcessing(true);
    try {
      const textFile = new File([text], "delegate.txt", { type: "text/plain" });
      setFileProgress([
        {
          file: textFile,
          status: "pending",
          progress: 0,
        },
      ]);

      updateFileProgress(0, { status: "constructing", progress: 25 });
      console.log("text", text);
      const base64Content = btoa(unescape(encodeURIComponent(text)));
      console.log("base64Content", base64Content);
      const constructedTx = await constructTx(
        api,
        base64Content,
        "text/plain" as TDataTypes
      );
      console.log("constructedTx", constructedTx);
      updateFileProgress(0, {
        status: "unsigned",
        progress: 50,
        txInfo: { constructedTx },
      });
      moveToNextStep("preparation");
    } catch (error) {
      console.error("Error preparing text:", error);
      setError(error instanceof Error ? error.message : JSON.stringify(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const pollForConfirmation = async (
    preparedTx: PreparedUTXOs
  ): Promise<boolean> => {
    const retryInterval = 9000;
    while (true) {
      try {
        const response = await fetch(
          buildApiUrl("/prepare-utxos/retrieve-submission-status"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": API_KEY || "",
            },
            body: JSON.stringify(preparedTx.executionArn),
          }
        );
        if (!response.ok) {
          let errorData;
          try {
            const errorResponse = response.clone();
            errorData = await errorResponse.json();
          } catch (e) {
            errorData = await response.text();
          }
          throw new Error(
            JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              error: errorData,
              endpoint: "/prepare-utxos/retrieve-submission-status",
            })
          );
        }
        const status: any = await response.json();
        if (status.success && status.success.onchain === "on-chain") {
          setSubmissionStatus(status);
          setIsProcessing(false);
          moveToNextStep("preparation");
          clearError();
          return true;
        }
        // Se continúa haciendo polling mientras la transacción no esté on-chain
        await new Promise((res) => setTimeout(res, retryInterval));
      } catch (error) {
        console.error("Polling attempt failed:", error);
        setError(
          error instanceof Error ? error.message : JSON.stringify(error)
        );
        throw error;
      }
    }
  };

  const handleSignAndSubmitError = (error: any) => {
    console.error("Error in sign and submit:", error);

    // Format the error message based on the error type
    let errorMessage: string;

    // Handle TxSignError from wallet
    if (error && error.name === "TxSignError") {
      errorMessage = `Wallet signing error: ${
        error.info || error.message || "Failed to sign transaction"
      }`;
    }
    // Handle Error objects
    else if (error instanceof Error) {
      try {
        // Try to parse the error message as JSON
        const parsedError = JSON.parse(error.message);
        errorMessage =
          parsedError.error?.message || parsedError.message || error.message;
      } catch (e) {
        // If parsing fails, use the original error message
        errorMessage = error.message || "Unknown error occurred";
      }
    }
    // Handle other error types
    else {
      try {
        errorMessage = JSON.stringify(error);
      } catch (e) {
        errorMessage = "Unknown error occurred";
      }
    }

    setError(errorMessage);
    setFileProgress((prev) =>
      prev.map((file) => ({ ...file, status: "failed", progress: 0 }))
    );
    // Don't reset the step to the beginning for wallet signing errors
    // This allows users to retry from the current step
    if (error && error.name === "TxSignError") {
      console.log("Wallet signing error detected, keeping current step");
      // Just set processing to false but don't change the step
      setIsProcessing(false);
    } else {
      // For other errors, we can reset processing state
      setIsProcessing(false);
    }
  };

  const signAndSubmit = async () => {
    if (!defaultWallet) throw new Error("No wallet connected");
    setIsProcessing(true);
    try {
      for (let i = 0; i < fileProgress.length; i++) {
        const file = fileProgress[i];
        console.log("file", file);
        if (!file.txInfo?.constructedTx) continue;
        const { executionArn } = file.txInfo.constructedTx;
        console.log("executionArn", executionArn);

        const unsignedTxResponse = await fetch(
          buildApiUrl("/prepare-utxos/retrieve-unsigned-tx"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": API_KEY || "",
            },
            body: JSON.stringify(executionArn),
          }
        );
        if (!unsignedTxResponse.ok) {
          let errorData;
          try {
            const errorResponse = unsignedTxResponse.clone();
            errorData = await errorResponse.json();
          } catch (e) {
            errorData = await unsignedTxResponse.text();
          }
          throw new Error(
            JSON.stringify({
              status: unsignedTxResponse.status,
              statusText: unsignedTxResponse.statusText,
              error: errorData,
              endpoint: "/prepare-utxos/retrieve-unsigned-tx",
            })
          );
        }
        let unsignedTx: RetrieveUnsignedTxResponse =
          await unsignedTxResponse.json();
        console.log("Unsigned TX:", unsignedTx);

        // Guardar el txid cuando está disponible
        if (unsignedTx.success && unsignedTx.success.txid) {
          setUnsignedTxId(unsignedTx.success.txid);
        }

        if (unsignedTx.inProgress) {
          while (unsignedTx.inProgress) {
            console.log("Unsigned transaction still in progress...");
            await new Promise((res) => setTimeout(res, 5000));
            const retryResponse = await fetch(
              buildApiUrl("/prepare-utxos/retrieve-unsigned-tx"),
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": API_KEY || "",
                },
                body: JSON.stringify(executionArn),
              }
            );
            if (!retryResponse.ok) {
              let errorData;
              try {
                const errorResponse = retryResponse.clone();
                errorData = await errorResponse.json();
              } catch (e) {
                errorData = await retryResponse.text();
              }
              throw new Error(
                JSON.stringify({
                  status: retryResponse.status,
                  statusText: retryResponse.statusText,
                  error: errorData,
                  endpoint: "/prepare-utxos/retrieve-unsigned-tx",
                })
              );
            }
            unsignedTx = await retryResponse.json();
            console.log("Retry Unsigned TX:", unsignedTx);
          }
        }

        updateFileProgress(i, {
          progress: 75,
          txInfo: { ...file.txInfo, unsignedTx },
        });

        const hexTx = base64ToHex(unsignedTx.success.tx);
        console.log("Hex TX:", hexTx);

        let signedTx;
        try {
          // Clear any previous error state before attempting to sign again
          clearError();

          // Get a fresh wallet API instance to ensure the popup appears again
          const api = getWalletApi(defaultWallet) as TWalletAPI;

          signedTx = await api.signTx(hexTx);
          console.log("Signed TX:", signedTx);

          updateFileProgress(i, {
            status: "signed",
            progress: 85,
            txInfo: { ...file.txInfo, unsignedTx, signedTx },
          });
          // Move to the next step only after successful signing
          moveToNextStep("preparation");
        } catch (error: any) {
          console.error("Error signing transaction:", error);
          // Don't move to the next step if there's a signing error
          // This allows the user to retry signing from the same step
          if (error && error.name === "TxSignError") {
            throw error; // Let the handleSignAndSubmitError function handle this specific error
          } else {
            throw new Error(
              `Failed to sign transaction: ${
                error.message || JSON.stringify(error)
              }`
            );
          }
        }

        const submitResponse = await fetch(
          buildApiUrl("/prepare-utxos/submit"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": API_KEY || "",
            },
            body: JSON.stringify({
              tx: unsignedTx.success.tx,
              ulid: unsignedTx.success.ulid,
              witnessSet: signedTx,
            }),
          }
        );
        if (!submitResponse.ok) {
          let errorData;
          try {
            const errorResponse = submitResponse.clone();
            errorData = await errorResponse.json();
          } catch (e) {
            errorData = await submitResponse.text();
          }
          throw new Error(
            JSON.stringify({
              status: submitResponse.status,
              statusText: submitResponse.statusText,
              error: errorData,
              endpoint: "/prepare-utxos/submit",
            })
          );
        }
        const submittedTx: PreparedUTXOs = await submitResponse.json();
        console.log("Submitted TX:", submittedTx);
        // Move to the next step after successful submission
        moveToNextStep("preparation");
        updateFileProgress(i, {
          status: "submitted",
          progress: 95,
          txInfo: { ...file.txInfo, unsignedTx, signedTx, submittedTx },
        });

        const confirmed = await pollForConfirmation(submittedTx);
        updateFileProgress(i, {
          status: confirmed ? "confirmed" : "failed",
          progress: confirmed ? 100 : 0,
        });
      }
    } catch (error) {
      handleSignAndSubmitError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = useCallback(() => {
    setFileProgress([]);
    setIsProcessing(false);
    setSubmissionStatus(undefined);
    setUnsignedTxId(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (error) {
      console.log("Error detected in TxPreparationContext:", error);

      // Update all file progress to failed status when an error occurs
      setFileProgress((prev) =>
        prev.map((file) => ({ ...file, status: "failed", progress: 0 }))
      );

      // Ensure processing state is reset
      setIsProcessing(false);
    }
  }, [error]);

  return (
    <TxPreparationContext.Provider
      value={{
        fileProgress,
        prepareFiles,
        prepareText,
        signAndSubmit,
        isProcessing,
        currentStep: preparation.currentStep as TxPreparationStep,
        nextStep: preparation.nextStep as TxPreparationStep | null,
        error,
        clearError,
        reset,
        submissionStatus,
        setSubmissionStatus,
        unsignedTxId,
        setUnsignedTxId,
      }}
    >
      {children}
    </TxPreparationContext.Provider>
  );
}
