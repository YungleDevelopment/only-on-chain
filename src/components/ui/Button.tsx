import React from "react";
import { useState } from "react";
import { motion, MotionValue } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon";
  loadingText?: string;
  successText?: string;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children?: React.ReactNode;
  animate?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  loadingText,
  successText,
  iconBefore,
  iconAfter,
  onClick,
  animate = true,
  className = "",
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      setIsLoading(animate);
      await onClick(event);
      setIsLoading(false);
      setIsSuccess(animate);
      setTimeout(() => setIsSuccess(false), 2000);
    }
  };

  const baseClasses =
    "!flex !justify-center !items-center !gap-2 !rounded-full !transition-colors !duration-300 !focus:outline-none !font-bold cursor-pointer";
  const variantClasses = {
    primary:
      "!border !border-white !bg-white !text-primary-tw hover:!bg-transparent hover:!text-white",
    secondary:
      "!border !border-white !bg-transparent !text-white hover:!text-white",
    ghost: "!bg-transparent !text-white hover:!bg-white/10",
    icon: "!rounded-full !w-10 !h-10 !p-2",
  };
  const disabledClasses = "!opacity-50 !cursor-not-allowed";
  const sizeClasses = variant === "icon" ? "" : "px-5 py-2";

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses} ${className} ${props.disabled ? disabledClasses : ""}`;

  return (
    <motion.button
      className={buttonClasses}
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      {...(props as any)}
    >
      {isLoading ? (
        <>
          <motion.div
            className="w-5 h-5 border-t-2 border-b-2 border-current rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
          {loadingText}
        </>
      ) : isSuccess ? (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            ✓
          </motion.div>
          {successText}
        </>
      ) : (
        <>
          {iconBefore}
          {Array.isArray(children) ? (
            children.map((child, index) =>
              child instanceof MotionValue ? (
                <motion.span key={index}>{child}</motion.span>
              ) : (
                child
              )
            )
          ) : children instanceof MotionValue ? (
            <motion.span>{children}</motion.span>
          ) : (
            children
          )}
          {iconAfter}
        </>
      )}
    </motion.button>
  );
};
