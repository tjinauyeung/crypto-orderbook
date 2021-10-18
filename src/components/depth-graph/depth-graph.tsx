import React from "react";
import "twin.macro";

export const DepthGraph = ({ total, maxTotal, orderType, ...props }) => {
  const depth = Math.floor((total / maxTotal) * 100);
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(to ${getDir(orderType)}, ${getColor(orderType)} 0 ${depth}%, transparent ${depth}% 100%)`,
      }}
      {...props}
    />
  );
};

const colors = {
  red: `rgba(255, 0, 0, 0.2)`,
  green: `rgba(0, 255, 0, 0.2)`,
};

const getDir = (orderType: string) => (orderType === "buy" ? "left" : "right");

const getColor = (orderType: string) => (orderType === "buy" ? colors.green : colors.red);
