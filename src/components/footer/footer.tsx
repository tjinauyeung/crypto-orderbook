import React from "react";
import "twin.macro";

export const Footer = ({ children, ...props }) => (
  <footer
    tw="sticky bottom-0 bg-gray-900 flex items-center justify-center p-4 gap-4"
    style={{ borderTop: "1px solid #777" }}
    {...props}
  >
    {children}
  </footer>
);
