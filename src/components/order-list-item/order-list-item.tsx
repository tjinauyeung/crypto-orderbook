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
  direction: 'rtl' | 'ltr'
};

export const OrderListItem = memo<OrderListItemProps>(
  ({ price, size, style, total, orderType, direction, depth }: OrderListItemProps) => {
    console.log('rerendering', direction);
    return (
      <div tw="col-span-3 relative h-6" style={style}>
        <DepthBar
          tw="absolute h-6 w-full top-0"
          depth={depth}
          orderType={orderType}
          direction={direction}
        />
        <div tw="grid grid-cols-3 relative">
          <div tw="px-2 py-1">{formatNumber(total)}</div>
          <div tw="px-2 py-1">{formatNumber(size)}</div>
          <div
            tw="px-2 py-1"
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
