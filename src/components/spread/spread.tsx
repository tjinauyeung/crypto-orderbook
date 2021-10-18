import React from "react";
import "twin.macro";
import { formatNumber } from "../../lib/formatters";
import { Spread as ISpread } from "../../types";

type Props = {
  spread: ISpread;
  style?: unknown;
};

export const Spread = ({ spread, ...props }: Props) => (
  <div tw="flex items-center justify-center font-mono flex p-2" {...props}>
    <span tw="mr-2">Spread</span>
    <span tw="mr-2">{formatNumber(spread.amount)}</span>
    <span>({formatNumber(spread.percentage)}%)</span>
  </div>
);
