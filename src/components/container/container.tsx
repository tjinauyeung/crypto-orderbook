import React, { forwardRef, ReactNode } from "react";
import 'twin.macro';

type ContainerProps = {
  children: ReactNode;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(({ children }, ref) => (
  <div
    tw="font-sans font-light divide-y divide-white h-screen flex flex-col bg-gray-900"
    ref={ref}
  >
    {children}
  </div>
));
