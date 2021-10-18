import React from "react";
import { Order, OrderType } from "../../types";
import { formatNumber, formatPrice } from "../../lib/formatters";
import { DepthBar } from "../depth-bar/depth-bar";
import tw from "twin.macro";

import { FixedSizeList as List } from "react-window";

type OrderListProps = {
  height: number;
  maxTotal: number;
  orders: Order[];
  orderType: OrderType;
};

export const OrderList = ({
  height,
  maxTotal,
  orders,
  orderType,
  ...props
}: OrderListProps) => (
  <section
    tw="grid grid-cols-3 flex-row-reverse text-right font-mono auto-rows-max"
    style={{ direction: orderType === OrderType.BUY ? "ltr" : "rtl" }}
    {...props}
  >
    <header
      tw="grid grid-cols-3 col-span-3 sticky top-0 bg-gray-900 z-10 justify-center hidden md:grid"
      style={{ borderBottom: "1px solid #777" }}
    >
      <div tw="uppercase p-2">Total</div>
      <div tw="uppercase p-2">Size</div>
      <div tw="uppercase p-2">Price</div>
    </header>

    <List
      height={height}
      itemCount={orders.length}
      itemSize={35}
      tw="col-span-3"
      style={{ direction: orderType === OrderType.BUY ? "ltr" : "rtl" }}
      {...props}
    >
      {({ index, style }) => {
        const [price, size, total] = orders[index];
        return (
          <div tw="col-span-3 relative h-6" style={style}>
            <DepthBar
              tw="absolute h-6 w-full top-0"
              depth={Math.ceil((total / maxTotal) * 100)}
              orderType={orderType}
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
      }}
    </List>
  </section>
);
