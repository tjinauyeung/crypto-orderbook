import React from "react";
import "twin.macro";

export const COLORS = {
  RED: `rgba(255, 0, 0, 0.2)`,
  GREEN: `rgba(0, 255, 0, 0.2)`,
};

type DepthBarProps = {
  depth: number;
  color: string;
  direction: "ltr" | "rtl";
};

export const DepthBar = ({ depth, color, direction, ...props }: DepthBarProps) => (
  <div
    style={{
      backgroundImage: `linear-gradient(to ${getDir(direction)}, ${color} 0 ${depth}%, transparent ${depth}% 100%)`,
    }}
    {...props}
  />
);

const getDir = (direction: string) => (direction === "ltr" ? "left" : "right");
