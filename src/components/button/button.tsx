import React, { MouseEvent, ReactNode } from "react";
import "twin.macro";

type ButtonProps = {
  children: ReactNode;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const Button = ({ children, onClick, ...props }: ButtonProps) => (
  <button
    tw="py-4 px-8 w-full w-full md:w-48 rounded outline-none border-none bg-purple-800 text-white cursor-pointer hover:bg-purple-900 transition duration-200"
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);
