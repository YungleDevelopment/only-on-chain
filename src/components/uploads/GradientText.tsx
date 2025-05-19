import React from "react";

export default function GradientText({ text }: { text: string }) {
  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-light)] to-white">
      {text}
    </span>
  );
}
