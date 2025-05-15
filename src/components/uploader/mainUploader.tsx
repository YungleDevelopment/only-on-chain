"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadBox } from "./upload-box";
import { FileList } from "./file-list";
import { DelegateView } from "./delegate-view";
import { useTxPreparation } from "../../context/TxPreparationContext";
import { useTxInscription } from "../../context/TxInscriptionContext";
import { LoadingScreen } from "../ui/LoadingScreen";
import { Button } from "../ui/Button";
import { useFileUpload } from "../../context/FileUploadContext";
import { useWallet } from "../../context/WalletContext";
import { FinishScreen } from "../ui/FinishScreen";
import { useTxStatus } from "../../context/TxStatusContext";
import { ProgressBar } from "../ui/ProgressBar";

type View = "files" | "delegate";

export default function MainUploader(): React.ReactElement {
  const [activeView, setActiveView] = useState<View>("files");
  // Se usa el nuevo contexto que maneja un solo archivo
  const { file, clearFile } = useFileUpload();
  const { defaultWallet } = useWallet();

  const {
    isProcessing: isPreparing,
    currentStep: prepareStep,
    nextStep: prepareNextStep,
    error: prepareError,
    clearError: clearPrepareError,
    prepareFiles,
    prepareText,
    signAndSubmit: signAndSubmitPreparation,
    reset: resetPreparation,
    submissionStatus: preparationSubmissionStatus,
    unsignedTxId,
  } = useTxPreparation();

  const {
    isProcessing: isInscribePreparing,
    currentStep: inscribeStep,
    nextStep: inscribeNextStep,
    error: inscribeError,
    clearError: clearInscribeError,
    inscribeFiles,
    signAndSubmit: signAndSubmitInscription,
    reset: resetInscription,
    submissionStatus,
    unsignedTx,
  } = useTxInscription();

  const [isPrepared, setIsPrepared] = useState(false);
  const [isInscribed, setIsInscribed] = useState(false);
  const [delegateText, setDelegateText] = useState("");
  const { resetStatus } = useTxStatus();

  useEffect(() => {
    console.log("prepareError", prepareError);
    console.log("inscribeError", inscribeError);
  }, [prepareError, inscribeError, clearPrepareError, clearInscribeError]);

  // Consolidated state management logic
  useEffect(() => {
    if (prepareError) {
      console.log("Resetting isPrepared due to error:", prepareError);
      setIsPrepared(false);
    } else if (prepareStep === "prepare/retrieve-submission" || preparationSubmissionStatus?.success?.onchain === "on-chain") {
      console.log("Final preparation step reached with no errors or transaction is on-chain, setting isPrepared to true");
      setIsPrepared(true);
    }

    if (inscribeError) {
      console.log("Resetting isInscribed due to error:", inscribeError);
      setIsInscribed(false);
    }

    console.log("prepareStep", prepareStep);
    console.log("inscribeStep", inscribeStep);
    console.log("isPrepared", isPrepared);
    console.log("isInscribed", isInscribed);
  }, [prepareError, prepareStep, preparationSubmissionStatus, inscribeError]);

  const getLoadingText = () => {
    if (!isPrepared) {
      switch (prepareStep) {
        case "prepare/construct":
          return "Preparing and constructing transaction...";
        case "prepare/retrieve":
          return "Retrieving utxo preparation transaction for signing...";
        case "prepare/submit":
          return "Submitting signed transaction...";
        case "prepare/retrieve-submission":
          return "Retrieving preparation submission status...";
        default:
          return "Processing...";
      }
    } else {
      switch (inscribeStep) {
        case "inscription/construct":
          return "Constructing inscription transaction...";
        case "inscription/retrieve":
          return "Retrieving utxo inscription transaction for signing...";
        case "inscription/submit":
          return "Submitting signed transaction...";
        case "inscription/retrieve-submission":
          return "Retrieving inscription submission status...";
        case "end":
          return "Transaction submitted!";
        default:
          return "Processing...";
      }
    }
  };

  const getProgressText = () => {
    if (isInscribed) {
      return "Inscription completed successfully!";
    }

    if (!isPrepared) {
      switch (prepareStep) {
        case "prepare/construct":
          return "Select content to upload";
        case "prepare/retrieve":
          return "Sign your transaction(s)";
        case "prepare/submit":
          return "Submitting your signed transaction(s)...";
        case "prepare/retrieve-submission":
          return "Validating your transaction(s) on chain...";
        default:
          return "Processing...";
      }
    } else {
      switch (inscribeStep) {
        case "inscription/construct":
          return "Confirm your inscription content";
        case "inscription/retrieve":
          return "Sign your transaction(s)";
        case "inscription/submit":
          return "Submitting your signed transaction(s)...";
        case "inscription/retrieve-submission":
          return "Validating your transaction(s) on chain...";
        case "end":
          return "Transaction submitted!";
        default:
          return "Processing...";
      }
    }
  };

  const getButtonText = () => {
    // If there's a wallet signing error, show "Retry Signing" button
    if (inscribeError && inscribeError.includes("Wallet signing error")) {
      return "Retry Signing";
    }
    if (prepareError && prepareError.includes("Wallet signing error")) {
      return "Retry Signing";
    }

    if (!isPrepared) {
      if (prepareStep === "prepare/construct") {
        return "Prepare UTxOs for inscription";
      } else if (prepareStep === "prepare/retrieve") {
        return "Sign and submit utxo preparation transaction";
      }
    } else if (isPrepared && !isInscribed) {
      if (inscribeStep === "inscription/construct") {
        return "Inscribe Onchain";
      } else if (inscribeStep === "inscription/retrieve") {
        return "Sign and Inscribe";
      }
    }
    return "Processing...";
  };

  const isInFinalStep = () => {
    return (
      inscribeStep === "inscription/retrieve-submission" || isInscribePreparing
    );
  };

  const handlePrepare = async () => {
    if (activeView === "files") {
      if (!file) return;
      await prepareFiles([file]); // se pasa el archivo como array de un solo elemento
    } else {
      await prepareText(delegateText);
    }
  };

  const handleInscribe = async () => {
    if (activeView === "files") {
      if (!file) return;
      await inscribeFiles([file]);
    } else {
      await inscribeFiles([
        new File([delegateText], "inscription.txt", { type: "text/plain" }),
      ]);
    }
  };

  const handleSignAndSubmitPreparation = async () => {
    try {
      setIsPrepared(false); // Reset the state before starting
      await signAndSubmitPreparation();
      // We'll let the useEffect handle setting isPrepared based on the step and error state
    } catch (error) {
      console.error("Error during preparation:", error);
      // Make sure isPrepared is false in case of error
      setIsPrepared(false);
    }
  };

  const handleSignAndSubmitInscription = async () => {
    try {
      await signAndSubmitInscription();
      // Only set isInscribed to true if there was no error
      if (!inscribeError) {
        setIsInscribed(true);
      }
    } catch (error) {
      console.error("Error during inscription:", error);
      // Make sure isInscribed is false in case of error
      setIsInscribed(false);
    }
  };

  const handleBack = () => {
    resetPreparation();
    setIsPrepared(false);
    // Solo reiniciamos el estado de preparación
    resetStatus("preparation");
  };

  const handleCancel = () => {
    resetPreparation();
    resetInscription();
    setIsPrepared(false);
    setIsInscribed(false);
    clearFile();
    setDelegateText("");
    resetStatus("preparation");
    resetStatus("inscription");
    setDelegateText("");
    
  };

  const showLoader = isPreparing || isInFinalStep();

  const handleMainButtonClick = async () => {
    // If there's a wallet signing error, retry the appropriate signing process
    if (prepareError && prepareError.includes("Wallet signing error")) {
      await handleSignAndSubmitPreparation();
      return;
    }
    
    if (inscribeError && inscribeError.includes("Wallet signing error")) {
      await handleSignAndSubmitInscription();
      return;
    }

    if (!isPrepared) {
      if (prepareStep === "prepare/construct") {
        await handlePrepare();
      } else if (prepareStep === "prepare/retrieve") {
        await handleSignAndSubmitPreparation();
      }
    } else if (isPrepared && !isInscribed) {
      if (inscribeStep === "inscription/construct") {
        await handleInscribe();
      } else if (inscribeStep === "inscription/retrieve") {
        await handleSignAndSubmitInscription();
      }
    }
  };

  const getTotalSteps = () => {
    return 8; // 4 prepare steps + 4 inscription steps
  };

  const getCurrentStep = () => {
    if (isInscribed) {
      return 8; // Stay at final step when inscription is complete
    }

    const prepareSteps: Record<string, number> = {
      "prepare/construct": 1,
      "prepare/retrieve": 2,
      "prepare/submit": 3,
      "prepare/retrieve-submission": 4,
    };

    const inscribeSteps: Record<string, number> = {
      "inscription/construct": 5,
      "inscription/retrieve": 6,
      "inscription/submit": 7,
      "inscription/retrieve-submission": 8,
      end: 8,
    };

    if (!isPrepared) {
      return prepareSteps[prepareStep] || 1;
    } else {
      return inscribeSteps[inscribeStep] || 5;
    }
  };

  const getStepPhase = () => {
    const currentStep = getCurrentStep();
    return currentStep <= 4 ? "Preparation" : "Inscription";
  };

  return (
    <motion.div
      className="bg-white/10 rounded-4xl backdrop-blur-[10px] p-8 max-w-5xl w-full mx-auto text-white"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <ProgressBar
          currentStep={getCurrentStep()}
          totalSteps={getTotalSteps()}
          stepText={getProgressText()}
          phase={getStepPhase()}
        />
      </div>
      {!showLoader && !isInscribed && (
        <div className="space-y-6">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-[1.25rem]">
              {prepareStep == "prepare/construct" ? (
                "Add File or Text to inscribe"
              ) : prepareStep == "prepare/retrieve" ? (
                "Preparing your UTxOs."
              ) : (
                <strong>
                  Please double check the text items below before continuing:
                </strong>
              )}
            </div>
            <div className="flex ">
              <button
                className={`px-2 py-[0.125rem] ${
                  activeView === "files"
                    ? "bg-[#051023] text-white"
                    : "bg-[#051023]/20 text-white/60"
                }`}
                onClick={() => setActiveView("files")}
                style={{ borderRadius: "0.25rem" }}
                disabled={prepareStep !== "prepare/construct"}
              >
                Files
              </button>
              <button
                className={`px-2 py-[0.125rem] ${
                  activeView === "delegate"
                    ? "bg-[#051023] text-white"
                    : "bg-[#051023]/20 text-white/60"
                }`}
                onClick={() => setActiveView("delegate")}
                style={{ borderRadius: "0.25rem" }}
                disabled={prepareStep !== "prepare/construct"}
              >
                Text
              </button>
            </div>
          </motion.div>
          <div className="flex flex-col gap-4">
            {(prepareError || inscribeError) && (
              <div className="text-sm text-red-600 bg-white p-4 rounded-md overflow-auto">
                <div className="mb-2 font-semibold">Error occurred:</div>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(
                    { error: prepareError || inscribeError },
                    null,
                    2
                  )}
                </pre>
                <button
                  onClick={
                    prepareError ? clearPrepareError : clearInscribeError
                  }
                  className="!mt-4 px-3 py-1 bg-blue-600 !text-white rounded hover:bg-blue-700"
                >
                  Clear Error
                </button>
              </div>
            )}
            {inscribeStep === "inscription/retrieve" ||
              inscribeStep === "inscription/submit" ||
              (inscribeStep === "inscription/construct" && isPrepared && (
                <div className="flex flex-col gap-2 text-[1.25rem]">
                  <div>
                    We take no responsibility for typos or wrong punctuation. We
                    are also not checking for any previous inscriptions
                    containing the same text.
                  </div>
                </div>
              ))}
            {activeView === "files" ? (
              <>
                {prepareStep === "prepare/construct" && <UploadBox />}
                {file && <FileList />}
              </>
            ) : (
              <DelegateView
                text={delegateText}
                setText={(text: string) => setDelegateText(text)}
                isProcessing={isPreparing || isInFinalStep()}
              />
            )}
          </div>
          <div className="flex gap-4">
            {(prepareStep === "prepare/retrieve" ||
              inscribeStep === "inscription/retrieve") && (
              <Button
                onClick={handleBack}
                animate={false}
                className="w-1/4"
                variant="secondary"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleMainButtonClick}
              className="w-full"
              disabled={
                (activeView === "files" && !file) ||
                (activeView === "delegate" && !delegateText.trim()) ||
                !defaultWallet ||
                // Don't disable the button when there's a wallet signing error
                (isPreparing && 
                  !(prepareError && prepareError.includes("Wallet signing error")) && 
                  !(inscribeError && inscribeError.includes("Wallet signing error"))
                ) ||
                isInFinalStep()
              }
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      )}
      {showLoader && <LoadingScreen text={getLoadingText()} />}

      {unsignedTxId && !isInscribed && (
        <div className="flex flex-col gap-4 items-center text-sm w-full mt-8">
          <div className="!text-white/80 font-semibold self-start">
            Preparation Phase
          </div>
          <div className="flex flex-col gap-2 w-full">
            {unsignedTxId && (
              <>
                <div className="!text-white/80 ">Preparation Transaction:</div>
                <a
                  href={`https://preprod.cardanoscan.io/transaction/${unsignedTxId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!text-white/80 hover:opacity-80 transition-colors flex items-center gap-2 w-full"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 12V3M12 3L9 6M12 3L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {unsignedTxId}
                </a>
              </>
            )}
            {/* <a
                href={`https://preprod.cardanoscan.io/transaction/${preparationSubmissionStatus.success.txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="!text-white/80 hover:opacity-80 transition-colors flex items-center gap-2 w-full"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 12V3M12 3L9 6M12 3L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {preparationSubmissionStatus.success.txid}
              </a> */}
          </div>
        </div>
      )}

      {(inscribeStep === "inscription/retrieve" ||
        inscribeStep === "inscription/submit") &&
        unsignedTx?.success && (
          <div className="flex flex-col gap-4 items-center text-sm w-full mt-8">
            <div className="flex flex-col gap-2 w-full">
              <div className="!text-white/80 font-semibold">
                Inscription Phase
              </div>
              <div className="border-t border-white/20 my-1"></div>
              <div className="!text-white/80 mt-2">
                Inscription Indexing Transaction:
              </div>
              <a
                href={`https://preprod.cardanoscan.io/transaction/${unsignedTx.success.indexingTxId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="!text-white/80 hover:opacity-80 transition-colors flex items-center gap-2 w-full"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 12V3M12 3L9 6M12 3L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {unsignedTx.success.indexingTxId}
              </a>
            </div>

            {unsignedTx.success.shardTxIds &&
              unsignedTx.success.shardTxIds.length > 0 && (
                <div className="flex flex-col gap-2 w-full mt-2">
                  <div className="!text-white/80 font-semibold">
                    Shard Transactions:
                  </div>
                  {unsignedTx.success.shardTxIds.map((shardTxId, index) => (
                    <a
                      key={index}
                      href={`https://preprod.cardanoscan.io/transaction/${shardTxId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="!text-white/80 hover:opacity-80 transition-colors flex items-center gap-2 w-full"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 12V3M12 3L9 6M12 3L15 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {shardTxId}
                    </a>
                  ))}
                </div>
              )}
          </div>
        )}

      {isInscribed && (
        <FinishScreen
          setIsPrepared={setIsPrepared}
          setIsInscribed={setIsInscribed}
          setDelegateText={setDelegateText}
          submissionStatus={submissionStatus}
          preparationTxId={preparationSubmissionStatus?.success?.txid}
          unsignedTxId={unsignedTxId ?? undefined}
          indexingTxId={unsignedTx?.success?.indexingTxId}
          shardTxIds={unsignedTx?.success?.shardTxIds}
        />
      )}
      {/*  {(prepareNextStep || inscribeNextStep) && (
        <div className="text-sm text-white/60">
          Next step: {prepareNextStep || inscribeNextStep}
        </div>
      )}
      {(prepareStep || inscribeStep) && (
        <div className="text-sm text-white/60">
          Current step: {prepareStep || inscribeStep}
        </div>
      )} */}
      {/* {(prepareError || inscribeError) && (
        <div className="text-sm text-red-500">
          Error: {prepareError || inscribeError}
          <button
            onClick={prepareError ? clearPrepareError : clearInscribeError}
            className="ml-2 text-blue-500"
          >
            Clear
          </button>
        </div>
      )} */}
    </motion.div>
  );
}
