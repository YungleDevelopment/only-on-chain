import React from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepText: string;
  phase: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepText,
  phase,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span
          className={`text-sm text-white/80 font-bold`}
        >
          Step {currentStep} of {totalSteps}: {stepText}
        </span>
        <span className="text-sm text-white/80">{phase}</span>
      </div>
      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
