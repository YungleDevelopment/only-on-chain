"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { useFileUpload } from "../../context/FileUploadContext";
import { useTxStatus } from "../../context/TxStatusContext";
import { useTxInscription } from "../../context/TxInscriptionContext";
import { useTxPreparation } from "../../context/TxPreparationContext";
import { TInscriptionSubmissionStatus } from "../../types/transaction";

interface FinishScreenProps {
  text?: string;
  className?: string;
  setIsPrepared: React.Dispatch<React.SetStateAction<boolean>>;
  setIsInscribed: React.Dispatch<React.SetStateAction<boolean>>;
  setDelegateText: React.Dispatch<React.SetStateAction<string>>;
  submissionStatus?: TInscriptionSubmissionStatus;
  preparationTxId?: string;
  unsignedTxId?: string;
  indexingTxId?: string;
  shardTxIds?: string[];
}

export const ExplorerLink = ({ txId }: { txId: string }) => (
  <a
    href={`https://preprod.cardanoscan.io/transaction/${txId}`}
    target="_blank"
    rel="noopener noreferrer"
    className="!text-white/80  hover:opacity-80 transition-colors flex items-center gap-2 w-full"
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
    {txId}
  </a>
);

export function FinishScreen({
  text = "Your submissions are now inscribed Onchain.",
  className = "",
  setIsPrepared,
  setIsInscribed,
  setDelegateText,
  submissionStatus,
  preparationTxId,
  unsignedTxId,
  indexingTxId,
  shardTxIds,
}: FinishScreenProps): React.ReactElement {
  const { resetStatus, setInscriptionStatus, setPreparationStatus } =
    useTxStatus();
  const { clearFile } = useFileUpload();
  const { reset } = useTxInscription();
  const { reset: resetPreparation } = useTxPreparation();

  return (
    <motion.div
      className={`w-full h-full z-50 flex flex-col items-center justify-center rounded-4xl !text-white ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div className="w-[1.45456rem] h-[1rem]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 28 20"
            fill="none"
          >
            <path
              d="M25.6364 2L9.63637 18L2.36365 10.7273"
              stroke="#2B80FF"
              strokeWidth="2.90909"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
        <p className="text-center text-[1.25rem]">{text}</p>

        <div className="flex flex-col gap-4 items-center text-sm w-full mt-4">
          {/* Preparation Transaction Section */}
          <div className="flex flex-col gap-2 w-full">
            <div className="!text-white/80 font-semibold">Preparation Phase</div>
            <div className="border-t border-white/20 my-1"></div>

            {preparationTxId && (
              <>
                <div className="!text-white/80 mt-2">
                  Preparation Transaction:
                </div>
                <ExplorerLink txId={preparationTxId} />
              </>
            )}
          </div>

          {/* Inscription Transaction Section */}
          <div className="flex flex-col gap-2 w-full mt-4">
            <div className="!text-white/80 font-semibold">Inscription Phase</div>
            <div className="border-t border-white/20 my-1"></div>

            {indexingTxId && (
              <>
                <div className="!text-white/80 mt-2">Indexing Transaction:</div>
                <ExplorerLink txId={indexingTxId} />
              </>
            )}

            {/* Shard Transactions Section */}
            {shardTxIds && shardTxIds.length > 0 && (
              <div className="flex flex-col gap-2 w-full mt-2">
                <div className="!text-white/80">Shard Transactions:</div>
                {shardTxIds.map((shardTxId, index) => (
                  <ExplorerLink key={index} txId={shardTxId} />
                ))}
              </div>
            )}

            {/* Fallback to submissionStatus if props not provided */}
            {submissionStatus?.success && !indexingTxId && (
              <>
                <div className="!text-white/80 mt-2">Indexing Transaction:</div>
                <ExplorerLink txId={submissionStatus.success.indexingTxId} />
              </>
            )}

            {submissionStatus?.success &&
              submissionStatus.success.allShardSubmissions.length > 0 &&
              !shardTxIds && (
                <div className="flex flex-col gap-2 w-full mt-2">
                  <div className="!text-white/80">Shard Transactions:</div>
                  {submissionStatus.success.allShardSubmissions.map(
                    (shard, index) => (
                      <ExplorerLink
                        key={index}
                        txId={shard.shardSubmittedTxid}
                      />
                    )
                  )}
                </div>
              )}
          </div>
        </div>

        <Button
          onClick={() => {
            resetStatus("preparation");
            resetStatus("inscription");
            setInscriptionStatus({});
            setPreparationStatus({});
            reset();
            resetPreparation();
            clearFile();
            setIsPrepared(false);
            setIsInscribed(false);
            setDelegateText("");
          }}
          className="mt-4"
        >
          Inscribe more
        </Button>
      </div>
    </motion.div>
  );
}
