// TxStatusContext.tsx
"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

interface TxStatus {
  isProcessing: boolean;
  currentStep: string;
  nextStep: string | null;
}

interface TxStatusContextType {
  preparation: TxStatus;
  inscription: TxStatus;
  setPreparationStatus: (status: Partial<TxStatus>) => void;
  setInscriptionStatus: (status: Partial<TxStatus>) => void;
  moveToNextStep: (flow: "preparation" | "inscription" | "end") => void;
  resetStatus: (flow: "preparation" | "inscription") => void;
}

const TxStatusContext = createContext<TxStatusContextType | undefined>(undefined);

export const TxStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [preparation, setPreparation] = useState<TxStatus>({
    isProcessing: false,
    currentStep: "prepare/construct",
    nextStep: "prepare/retrieve",
  });

  const [inscription, setInscription] = useState<TxStatus>({
    isProcessing: false,
    currentStep: "inscription/construct",
    nextStep: "inscription/retrieve",
  });

  const setPreparationStatus = useCallback((status: Partial<TxStatus>) => {
    setPreparation((prev) => ({ ...prev, ...status }));
  }, []);

  const setInscriptionStatus = useCallback((status: Partial<TxStatus>) => {
    setInscription((prev) => ({ ...prev, ...status }));
  }, []);

  const moveToNextStep = (flow: "preparation" | "inscription" | "end") => {
    if (flow === "preparation" && preparation.nextStep) {
      const nextStepMap: { [key: string]: string | null } = {
        "prepare/construct": "prepare/retrieve",
        "prepare/retrieve": "prepare/submit",
        "prepare/submit": "prepare/retrieve-submission",
        "prepare/retrieve-submission": null,
      };
      const currentStep = preparation.nextStep;
      const nextStep = nextStepMap[currentStep];
      setPreparationStatus({ currentStep, nextStep });
    } else if (flow === "inscription" && inscription.nextStep) {
      const nextStepMap: { [key: string]: string | null } = {
        "inscription/construct": "inscription/retrieve",
        "inscription/retrieve": "inscription/submit",
        "inscription/submit": "inscription/retrieve-submission",
        "inscription/retrieve-submission": null,
      };
      const currentStep = inscription.nextStep;
      const nextStep = nextStepMap[currentStep];
      setInscriptionStatus({ currentStep, nextStep });
    } else if (flow === "end") {
      // Al llegar al final, reiniciamos los estados
      setPreparation({
        isProcessing: false,
        currentStep: "prepare/construct",
        nextStep: "prepare/retrieve",
      });
      setInscription({
        isProcessing: false,
        currentStep: "inscription/construct",
        nextStep: "inscription/retrieve",
      });
    }
  };

  const resetStatus = (flow: "preparation" | "inscription") => {
    if (flow === "preparation") {
      setPreparation({
        isProcessing: false,
        currentStep: "prepare/construct",
        nextStep: "prepare/retrieve",
      });
    } else {
      setInscription({
        isProcessing: false,
        currentStep: "inscription/construct",
        nextStep: "inscription/retrieve",
      });
    }
  };

  return (
    <TxStatusContext.Provider
      value={{
        preparation,
        inscription,
        setPreparationStatus,
        setInscriptionStatus,
        moveToNextStep,
        resetStatus,
      }}
    >
      {children}
    </TxStatusContext.Provider>
  );
};

export const useTxStatus = () => {
  const context = useContext(TxStatusContext);
  if (!context) {
    throw new Error("useTxStatus must be used within a TxStatusProvider");
  }
  return context;
};