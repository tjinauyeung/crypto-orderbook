import React from "react";
import "twin.macro";

export const Footer = ({ children }) => (
  <footer
    tw="sticky bottom-0 bg-gray-900 flex p-4 items-center justify-center"
    style={{ borderTop: "1px solid #777" }}
  >
    {children}
  </footer>
);
