import React from "react";
import { Orders, Order } from "../../types";
import { formatNumber, formatPrice } from "../../utils/formatters";
import { DepthGraph } from "../depth-graph/depth-graph";
import tw from "twin.macro";

import { FixedSizeList as List } from "react-window";

type OrderListProps = {
  orders: Orders;
  maxTotal: number;
  orderType: "buy" | "sell";
};

export const OrderList = ({ orders, maxTotal, orderType, ...props }: OrderListProps) => (
  <div tw="grid grid-cols-3 flex-row-reverse text-right font-mono auto-rows-max" style={{ direction: orderType === "buy" ? "ltr" : "rtl" }} {...props}>
    <div tw="grid grid-cols-3 col-span-3 sticky top-0 bg-gray-900 z-10 justify-center hidden md:grid" style={{ borderBottom: "1px solid #777" }}>
      <div tw="uppercase p-2">Total</div>
      <div tw="uppercase p-2">Size</div>
      <div tw="uppercase p-2">Price</div>
    </div>
    <List height={800} itemCount={orders.length} itemSize={35} tw="col-span-3" style={{ direction: orderType === "buy" ? "ltr" : "rtl" }} {...props}>
      {({ index, style }) => {
        const [price, size, total] = orders[index];
        return (
          <div tw="col-span-3 relative h-6" style={style}>
            <DepthGraph tw="absolute h-6 w-full top-0" total={total} maxTotal={maxTotal} orderType={orderType} />
            <div tw="grid grid-cols-3 relative">
              <div tw="px-2 py-1">{formatNumber(total)}</div>
              <div tw="px-2 py-1">{formatNumber(size)}</div>
              <div tw="px-2 py-1" css={[orderType === "buy" ? tw`text-green-400` : tw`text-red-400`]}>
                {formatPrice(price)}
              </div>
            </div>
          </div>
        );
      }}
    </List>
  </div>
);
