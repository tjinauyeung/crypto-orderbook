import React from "react";
import "twin.macro";

export const Footer = ({ children, ...props }) => (
  <footer
    tw="sticky bottom-0 bg-gray-900 flex p-4 items-center justify-center gap-2"
    style={{ borderTop: "1px solid #777" }}
    {...props}
  >
    {children}
  </footer>
);
