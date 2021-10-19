import React, { useCallback, useRef } from "react";
import { Order, OrderType } from "../../types";
import { OrderListItem } from "../order-list-item/order-list-item";
import { FixedSizeList as List } from "react-window";
import "twin.macro";
import { COLORS, DepthBar } from "../depth-bar/depth-bar";

type OrderListProps = {
  height: number;
  maxTotal: number;
  orders: Order[];
  orderType: OrderType;
  direction: "ltr" | "rtl";
};

export const OrderList = ({
  height,
  maxTotal,
  orders,
  orderType,
  direction,
  ...props
}: OrderListProps) => {
  const listRef = useRef(null);

  const Row = useCallback(
    ({ index, style }) => {
      const [price, size, total] = orders[index];
      return (
        <OrderListItem
          key={price}
          style={style}
          price={price}
          size={size}
          total={total}
          orderType={orderType}
          direction={direction}
        >
          <DepthBar
            tw="absolute top-0 h-8 w-full"
            depth={(total / maxTotal) * 100}
            color={orderType === OrderType.BUY ? COLORS.GREEN : COLORS.RED}
            direction={direction}
          />
        </OrderListItem>
      );
    },
    [orders, direction]
  );

  return (
    <section tw="text-right font-mono text-sm relative" {...props}>
      <header
        tw="grid grid-cols-3 sticky top-0 z-10 justify-center hidden md:grid uppercase"
        style={{ borderBottom: "1px solid #555", direction }}
      >
        <div tw="p-3">Total</div>
        <div tw="p-3">Size</div>
        <div tw="p-3">Price</div>
      </header>

      <List
        style={{ direction }}
        ref={listRef}
        height={height}
        itemCount={orders.length}
        itemSize={32}
        {...props}
      >
        {Row}
      </List>
    </section>
  );
};
