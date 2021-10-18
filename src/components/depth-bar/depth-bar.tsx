import React from "react";
import { OrderType } from "../../types";
import "twin.macro";

const COLORS = {
  RED: `rgba(255, 0, 0, 0.2)`,
  GREEN: `rgba(0, 255, 0, 0.2)`,
};

type DepthBarProps = {
  depth: number;
  orderType: OrderType;
  direction: "ltr" | "rtl";
};

export const DepthBar = ({
  depth,
  orderType,
  direction,
  ...props
}: DepthBarProps) => (
  <div
    style={{
      backgroundImage: `linear-gradient(to ${getDir(direction)}, ${getColor(
        orderType
      )} 0 ${depth}%, transparent ${depth}% 100%)`,
    }}
    {...props}
  />
);

const getDir = (direction: string) => (direction === "ltr" ? "left" : "right");
const getColor = (orderType: string) =>
  orderType === "buy" ? COLORS.GREEN : COLORS.RED;
