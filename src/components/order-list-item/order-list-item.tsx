import React, { CSSProperties, memo, ReactNode } from "react";
import { formatNumber, formatPrice } from "../../lib/formatters";
import { OrderType } from "../../types";
import tw from "twin.macro";

type OrderListItemProps = {
  price: number;
  size: number;
  style: CSSProperties;
  total: number;
  orderType: OrderType;
  direction: "rtl" | "ltr";
  children: ReactNode;
};

export const OrderListItem = memo<OrderListItemProps>(
  ({ price, size, style, total, orderType, children }: OrderListItemProps) => (
    <div tw="relative h-8" style={style}>
      <div tw="grid grid-cols-3">
        <div tw="p-2">{formatNumber(total)}</div>
        <div tw="p-2">{formatNumber(size)}</div>
        <div
          tw="p-2"
          css={[
            orderType === OrderType.BUY ? tw`text-green-400` : tw`text-red-400`,
          ]}
        >
          {formatPrice(price)}
        </div>
      </div>
      {children}
    </div>
  )
);
