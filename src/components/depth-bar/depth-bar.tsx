import React from "react";
import "twin.macro";
import { OrderType } from "../../types";

const COLORS = {
  RED: `rgba(255, 0, 0, 0.2)`,
  GREEN: `rgba(0, 255, 0, 0.2)`,
};

type Props = {
  depth: number;
  orderType: OrderType;
};

export const DepthBar = ({ depth, orderType, ...props }: Props) => (
  <div
    style={{
      backgroundImage: `linear-gradient(to ${getDir(orderType)}, ${getColor(
        orderType
      )} 0 ${depth}%, transparent ${depth}% 100%)`,
    }}
    {...props}
  />
);

const getDir = (orderType: string) => (orderType === "buy" ? "left" : "right");
const getColor = (orderType: string) =>
  orderType === "buy" ? COLORS.GREEN : COLORS.RED;
