import React, { CSSProperties } from "react";
import "twin.macro";
import { formatNumber } from "../../lib/formatters";
import { Spread as ISpread } from "../../types";

type SpreadProps = {
  spread: ISpread;
  style?: CSSProperties;
};

export const Spread = ({ spread, style, ...props }: SpreadProps) => (
  <div
    tw="flex items-center justify-center font-mono flex p-2"
    style={style}
    {...props}
  >
    <span tw="mr-2">Spread</span>
    <span tw="mr-2">{formatNumber(spread.amount)}</span>
    <span>({formatNumber(spread.percentage)}%)</span>
  </div>
);
