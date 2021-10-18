import React, { memo } from "react";
import { formatNumber, formatPrice } from "../../lib/formatters";
import { OrderType } from "../../types";
import { DepthBar } from "../depth-bar/depth-bar";
import tw from "twin.macro";

type OrderListItemProps = {
  price: number;
  size: number;
  style: any;
  total: number;
  orderType: OrderType;
  depth: number;
  direction: "rtl" | "ltr";
};

export const OrderListItem = memo<OrderListItemProps>(
  ({
    price,
    size,
    style,
    total,
    orderType,
    direction,
    depth,
  }: OrderListItemProps) => {
    return (
      <div tw="relative h-8" style={style}>
        <DepthBar
          tw="absolute top-0 h-8 w-full"
          depth={depth}
          orderType={orderType}
          direction={direction}
        />
        <div tw="grid grid-cols-3">
          <div tw="p-2">{formatNumber(total)}</div>
          <div tw="p-2">{formatNumber(size)}</div>
          <div
            tw="p-2"
            css={[
              orderType === OrderType.BUY
                ? tw`text-green-400`
                : tw`text-red-400`,
            ]}
          >
            {formatPrice(price)}
          </div>
        </div>
      </div>
    );
  }
);
