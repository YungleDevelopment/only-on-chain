import React from "react";

interface CloseIconProps {
  className?: string;
}

export const CloseIconSecondary: React.FC<CloseIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M18.0553 0.333831C18.5002 -0.111047 19.2215 -0.111047 19.6663 0.33383C20.1112 0.778708 20.1112 1.5 19.6663 1.94487L1.94486 19.6664C1.49998 20.1112 0.778695 20.1112 0.333818 19.6664C-0.111059 19.2215 -0.111059 18.5002 0.333818 18.0553L18.0553 0.333831Z"
        fill="currentColor"
      />
      <path
        d="M0.333658 1.9447C-0.111219 1.49982 -0.11122 0.778535 0.333658 0.333658C0.778535 -0.111219 1.49982 -0.111219 1.9447 0.333658L19.6662 18.0551C20.1111 18.5 20.1111 19.2213 19.6662 19.6662C19.2213 20.1111 18.5 20.1111 18.0551 19.6662L0.333658 1.9447Z"
        fill="currentColor"
      />
    </svg>
  );
};
