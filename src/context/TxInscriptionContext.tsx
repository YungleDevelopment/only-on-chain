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
  ConstructTxResponse,
  RetrieveUnsignedInscriptionTxResponse,
  PreparedUTXOs,
  TDataTypes,
  ConstructTxInscribeRequest,
  TInscriptionSubmissionStatus,
} from "../types/transaction";
import { API_KEY, base64ToHex, buildApiUrl } from "../utils/apiConsumption";
import { useTxStatus } from "./TxStatusContext";

export type TxInscriptionStep =
  | "inscription/construct"
  | "inscription/retrieve"
  | "inscription/submit"
  | "inscription/retrieve-submission"
  | "end";

interface TxInscriptionContextType {
  fileProgress: FileProgress[];
  inscribeFiles: (files: File[]) => Promise<void>;
  inscribeText: (text: string) => Promise<void>;
  signAndSubmit: () => Promise<void>;
  isProcessing: boolean;
  currentStep: TxInscriptionStep;
  nextStep: TxInscriptionStep | null;
  error: string | null;
  clearError: () => void;
  reset: () => void;
  submissionStatus?: TInscriptionSubmissionStatus;
  unsignedTx?: RetrieveUnsignedInscriptionTxResponse;
  setUnsignedTx: (
    tx: RetrieveUnsignedInscriptionTxResponse | undefined
  ) => void;
}

const TxInscriptionContext = createContext<TxInscriptionContextType>({
  fileProgress: [],
  inscribeFiles: async () => {},
  inscribeText: async () => {},
  signAndSubmit: async () => {},
  isProcessing: false,
  currentStep: "inscription/construct",
  nextStep: null,
  error: null,
  clearError: () => {},
  reset: () => {},
  submissionStatus: undefined,
  unsignedTx: undefined,
  setUnsignedTx: () => {},
});

export function useTxInscription() {
  const context = useContext(TxInscriptionContext);
  if (!context) {
    throw new Error(
      "useTxInscription must be used within a TxInscriptionProvider"
    );
  }
  return context;
}

export function TxInscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<
    TInscriptionSubmissionStatus | undefined
  >();
  const [unsignedTx, setUnsignedTx] = useState<
    RetrieveUnsignedInscriptionTxResponse | undefined
  >();
  const { getWalletApi, defaultWallet } = useWallet();
  const { inscription, moveToNextStep } = useTxStatus();

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

  const reset = useCallback(() => {
    setFileProgress([]);
    setIsProcessing(false);
    setSubmissionStatus(undefined);
    setUnsignedTx(undefined);
    setError(null);
  }, []);

  const constructInscriptionTx = async (
    api: TWalletAPI,
    data: string,
    dataType: TDataTypes
  ): Promise<ConstructTxResponse> => {
    const rewardAddresses = (await api.getRewardAddresses()) as string[];
    const utxos = (await api.getUtxos()) || [];
    console.log("UTXOs:", utxos);
    const targetAddress = (await api.getUsedAddresses())[0];
    if (!utxos || utxos.length === 0) {
      setError("No hay UTXOs disponibles");
      throw new Error("No UTXOs available");
    }

    const body: ConstructTxInscribeRequest = {
      payload: data,
      payloadType: dataType,
      rewardAddresses,
      changeAddress: targetAddress,
      utxos,
      mintTokenForPayload: "NoMinting",
    };
    console.log("Body:", body);

    const response = await fetch(buildApiUrl("/inscriptions/construct-tx"), {
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
          endpoint: "/inscriptions/construct-tx",
        })
      );
    }
    // Avanzamos en el flujo de inscripción
    moveToNextStep("inscription");
    const constructedTx = await response.json();
    console.log("Constructed TX:", constructedTx);
    setIsProcessing(false);
    return constructedTx;
  };

  const inscribeFiles = async (files: File[]) => {
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
        const constructedTx = await constructInscriptionTx(
          api,
          base64Content,
          files[i].type as TDataTypes
        );
        updateFileProgress(i, {
          status: "unsigned",
          progress: 50,
          txInfo: { constructedTx },
        });
      }
      moveToNextStep("inscription");
    } catch (error) {
      console.error("Error inscribing files:", error);
      setError(error instanceof Error ? error.message : JSON.stringify(error));
      setIsProcessing(false);
    }
  };

  const inscribeText = async (text: string) => {
    if (!defaultWallet) throw new Error("No wallet connected");
    const api = getWalletApi(defaultWallet) as TWalletAPI;
    setIsProcessing(true);

    try {
      const textFile = new File([text], "inscription.txt", {
        type: "text/plain",
      });
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
      const constructedTx = await constructInscriptionTx(
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

      moveToNextStep("inscription");
    } catch (error) {
      console.error("Error inscribing text:", error);
      setError(error instanceof Error ? error.message : JSON.stringify(error));
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const pollForConfirmation = async (
    preparedTx: PreparedUTXOs
  ): Promise<boolean> => {
    const retryInterval = 9000;
    setIsProcessing(true);
    while (true) {
      try {
        const response = await fetch(
          buildApiUrl("/inscriptions/retrieve-submission-status"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": API_KEY || "",
            },
            body: JSON.stringify(preparedTx.executionArn),
          }
        );

        // Si el servidor responde con un error 500, se interrumpe el loop
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
              endpoint: "/inscriptions/retrieve-submission-status",
            })
          );
        }

        // Parse the response carefully to handle potential JSON decoding errors
        let status: TInscriptionSubmissionStatus;
        try {
          const responseText = await response.text();

          // Check if the response contains States.Timeout error
          if (
            responseText.includes("States.Timeout") ||
            responseText.includes("JsonDecodeError")
          ) {
            console.error(
              "Timeout or JSON decode error detected:",
              responseText
            );
            const errorMessage =
              "Transaction processing timed out or encountered a decoding error. Please try again later.";
            setError(errorMessage);
            setIsProcessing(false);
            return false;
          }

          status = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          throw new Error(
            JSON.stringify({
              message: "Failed to parse submission status response",
              error:
                parseError instanceof Error
                  ? parseError.message
                  : String(parseError),
              endpoint: "/inscriptions/retrieve-submission-status",
            })
          );
        }

        // Se espera que el endpoint retorne { inProgress: "string" } mientras no esté on-chain
        // y en caso de éxito retorne { success: { onchain: "on-chain", ... } }
        if (status.success && status.success.onchain) {
          setSubmissionStatus(status);
          setIsProcessing(false);
          moveToNextStep("inscription");
          console.log("Transaction retrieved:", status);
          return true;
        }
        if (status.inProgress) {
          console.log("Transaction still in progress...");
        } else {
          throw new Error(
            JSON.stringify({
              message: "Unexpected submission status response",
              status,
              endpoint: "/inscriptions/retrieve-submission-status",
            })
          );
        }
        await new Promise((res) => setTimeout(res, retryInterval));
      } catch (error) {
        console.error("Polling attempt failed:", error);

        // Format the error message for better readability
        let errorMessage: string;
        if (error instanceof Error) {
          try {
            // Try to parse the error message as JSON for better formatting
            const parsedError = JSON.parse(error.message);
            if (parsedError.error && typeof parsedError.error === "object") {
              // Handle the specific JsonDecodeError case
              if (
                parsedError.error.message &&
                parsedError.error.message.includes('key "onchain" not found')
              ) {
                errorMessage =
                  "Transaction processing error: The transaction data is incomplete. Please try again later.";
              } else {
                errorMessage = `Error: ${JSON.stringify(
                  parsedError.error,
                  null,
                  2
                )}`;
              }
            } else {
              errorMessage = error.message;
            }
          } catch (e) {
            // If parsing fails, use the original error message
            errorMessage = error.message;
          }
        } else {
          errorMessage = JSON.stringify(error);
        }

        setError(errorMessage);
        setIsProcessing(false);

        // Update file progress to failed
        setFileProgress((prev) =>
          prev.map((file) => ({ ...file, status: "failed", progress: 0 }))
        );

        return false;
      }
    }
  };

  const handleSignAndSubmitError = (error: any) => {
    console.error("Error in sign and submit for inscription:", error);

    // Format the error message based on the error type
    let errorMessage: string;

    // Handle TxSignError from wallet
    if (error && error.name === "TxSignError") {
      errorMessage = `Wallet signing error: ${
        error.info || error.message || "Failed to sign transaction"
      }`;
      // No actualizamos el estado de los archivos aquí ya que lo hacemos en el catch del sign
      // Solo limpiamos el error y permitimos reintentar
      setError(errorMessage);
      setIsProcessing(false);
      console.log(
        "Wallet signing error detected, keeping current step for retry"
      );
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

      setError(errorMessage);
      setFileProgress((prev) =>
        prev.map((file) => ({ ...file, status: "failed", progress: 0 }))
      );
      setIsProcessing(false);
      // For other errors, reset to the beginning
      console.log("Other error detected, moving to end: ", error);
      moveToNextStep("end");
    }
    // Handle other error types
    else {
      try {
        errorMessage = JSON.stringify(error);
      } catch (e) {
        errorMessage = "Unknown error occurred";
      }

      setError(errorMessage);
      setFileProgress((prev) =>
        prev.map((file) => ({ ...file, status: "failed", progress: 0 }))
      );
      setIsProcessing(false);
      // For other errors, reset to the beginning
      console.log("Other error detected, moving to end: ", error);
      moveToNextStep("end");
    }
  };

  const signAndSubmit = async () => {
    if (!defaultWallet) throw new Error("No wallet connected");
    const api = getWalletApi(defaultWallet) as TWalletAPI;
    setIsProcessing(true);

    try {
      for (let i = 0; i < fileProgress.length; i++) {
        const file = fileProgress[i];
        if (!file.txInfo?.constructedTx) continue;
        const { executionArn } = file.txInfo.constructedTx;
        console.log("executionArn", executionArn);

        // Solo obtener unsignedTx si no lo tenemos ya
        let unsignedTx = file.txInfo
          .unsignedTx as RetrieveUnsignedInscriptionTxResponse;
        if (!unsignedTx) {
          while (true) {
            const unsignedTxResponse = await fetch(
              buildApiUrl("/inscriptions/retrieve-unsigned-tx"),
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
                  endpoint: "/inscriptions/retrieve-unsigned-tx",
                })
              );
            }

            unsignedTx = await unsignedTxResponse.json();
            console.log("Unsigned TX:", unsignedTx);

            if (unsignedTx.success && unsignedTx.success.indexingTx) {
              console.log("Unsigned transaction retrieved:", unsignedTx);
              setUnsignedTx(unsignedTx);
              moveToNextStep("inscription");
              setIsProcessing(false);
              break;
            }

            if (unsignedTx.inProgress) {
              console.log("Unsigned transaction still in progress...");
              await new Promise((res) => setTimeout(res, 5000));
            } else {
              throw new Error(
                JSON.stringify({
                  message:
                    "Unexpected response while retrieving unsigned transaction",
                  response: unsignedTx,
                  endpoint: "/inscriptions/retrieve-unsigned-tx",
                })
              );
            }
          }
        }

        updateFileProgress(i, {
          progress: 75,
          txInfo: { ...file.txInfo, unsignedTx },
        });

        let signedTx;
        try {
          // Clear any previous error state before attempting to sign again
          clearError();

          // Get a fresh wallet API instance to ensure the popup appears again
          const api = getWalletApi(defaultWallet) as TWalletAPI;

          signedTx = await api.signTx(
            base64ToHex(unsignedTx.success.indexingTx)
          );
          console.log("Signed TX:", signedTx);
          updateFileProgress(i, {
            status: "signed",
            progress: 85,
            txInfo: { ...file.txInfo, unsignedTx, signedTx },
          });
          moveToNextStep("inscription");
        } catch (error: any) {
          console.error("Error signing transaction:", error);
          // Don't move to the next step if there's a signing error
          // This allows the user to retry signing from the same step
          if (error && error.name === "TxSignError") {
            // Mantener el estado actual y permitir reintentar
            setFileProgress((prev) =>
              prev.map((item, idx) =>
                idx === i
                  ? {
                      ...item,
                      status: "unsigned",
                      progress: 75,
                      error: error.message,
                    }
                  : item
              )
            );
            throw error; // Let the handleSignAndSubmitError function handle this specific error
          } else {
            throw new Error(
              `Failed to sign transaction: ${
                error.message || JSON.stringify(error)
              }`
            );
          }
        }

        const signedShardTxs = await Promise.all(
          unsignedTx.success.shardTxs.map(async (shardTx) => {
            const hexShardTx = base64ToHex(shardTx);
            console.log("Hex Shard TX:", hexShardTx);
            try {
              // Get a fresh wallet API instance for each shard transaction
              const api = getWalletApi(defaultWallet) as TWalletAPI;
              return await api.signTx(hexShardTx);
            } catch (error: any) {
              console.error("Error signing shard transaction:", error);
              // Mantener el estado actual y permitir reintentar
              if (error && error.name === "TxSignError") {
                setFileProgress((prev) =>
                  prev.map((item, idx) =>
                    idx === i
                      ? {
                          ...item,
                          status: "unsigned",
                          progress: 75,
                          error: error.message,
                        }
                      : item
                  )
                );
                throw error; // Let the handleSignAndSubmitError function handle this specific error
              } else {
                throw new Error(
                  `Failed to sign shard transaction: ${
                    error.message || JSON.stringify(error)
                  }`
                );
              }
            }
          })
        );
        console.log("Signed Shard TXs:", signedShardTxs);
        updateFileProgress(i, {
          status: "signed",
          progress: 90,
          txInfo: {
            ...file.txInfo,
            unsignedTx,
            signedTx,
          },
        });
        // Move to the next step after successful signing of all transactions
        moveToNextStep("inscription");

        const inscribeSubmitBody = {
          indexingTxToSubmit: [unsignedTx.success.indexingTx, signedTx],
          txsToSubmit: unsignedTx.success.shardTxs.map((shardTx, index) => [
            shardTx,
            signedShardTxs[index],
          ]),
          ulidOfObject: unsignedTx.success.objectUlid,
        };
        console.log("Inscribe submit body:", inscribeSubmitBody);

        const submitResponse = await fetch(
          buildApiUrl("/inscriptions/submit"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": API_KEY || "",
            },
            body: JSON.stringify(inscribeSubmitBody),
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
              endpoint: "/inscriptions/submit",
            })
          );
        }
        const submittedTx: PreparedUTXOs = await submitResponse.json();
        console.log("Submitted TX:", submittedTx);
        // Move to the next step after successful submission
        moveToNextStep("inscription");
        updateFileProgress(i, {
          status: "submitted",
          progress: 95,
          txInfo: {
            ...file.txInfo,
            unsignedTx,
            signedTx,
            submittedTx,
          },
        });

        const confirmed = await pollForConfirmation(submittedTx);
        updateFileProgress(i, {
          status: confirmed ? "confirmed" : "failed",
          progress: confirmed ? 100 : 0,
        });
        moveToNextStep("inscription");
      }
      // Al finalizar, se establece el estado final "end"
      moveToNextStep("end");
      setIsProcessing(false);
    } catch (error) {
      handleSignAndSubmitError(error);
    }
  };

  useEffect(() => {
    if (error) {
      console.error("Error occurred:", error);
      setFileProgress((prev) =>
        prev.map((file) => ({ ...file, status: "failed", progress: 0 }))
      );
      setIsProcessing(false);
    }
  }, [error]);

  return (
    <TxInscriptionContext.Provider
      value={{
        fileProgress,
        inscribeFiles,
        inscribeText,
        signAndSubmit,
        isProcessing,
        currentStep: inscription.currentStep as TxInscriptionStep,
        nextStep: inscription.nextStep as TxInscriptionStep | null,
        error,
        clearError,
        reset,
        submissionStatus,
        unsignedTx,
        setUnsignedTx,
      }}
    >
      {children}
    </TxInscriptionContext.Provider>
  );
}
