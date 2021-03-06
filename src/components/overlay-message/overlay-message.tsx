import "twin.macro";
import React, { ReactNode } from "react";

type OverlayMessageProps = {
  children: ReactNode;
};

export const OverlayMessage = ({ children }: OverlayMessageProps) => (
  <div tw="fixed top-0 left-0 right-0 bottom-0 bg-opacity-50 bg-black font-mono flex items-center justify-center text-sm z-50 text-center">
    <div>{children}</div>
  </div>
);
