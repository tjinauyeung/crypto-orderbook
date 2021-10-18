import React, { useCallback } from "react";
import { Order, OrderType } from "../../types";
import { OrderListItem } from "../order-list-item/order-list-item";
import { FixedSizeList as List } from "react-window";
import "twin.macro";

type OrderListProps = {
  height: number;
  maxTotal: number;
  orders: Order[];
  orderType: OrderType;
  direction: "ltr" | "rtl";
  reverse?: boolean;
};

export const OrderList = ({
  height,
  maxTotal,
  orders,
  orderType,
  direction,
  reverse,
  ...props
}: OrderListProps) => {
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
          depth={Math.ceil((total / maxTotal) * 100)}
          orderType={orderType}
          direction={direction}
        />
      );
    },
    [orders, direction]
  );

  return (
    <section tw="text-right font-mono text-sm" {...props}>
      <header
        tw="grid grid-cols-3 sticky top-0 z-10 justify-center hidden md:grid uppercase"
        style={{ borderBottom: "1px solid #777", direction }}
      >
        <div tw="p-3">Total</div>
        <div tw="p-3">Size</div>
        <div tw="p-3">Price</div>
      </header>

      <List
        height={height}
        itemCount={orders.length}
        itemSize={32}
        style={{ direction }}
        {...props}
      >
        {Row}
      </List>
    </section>
  );
};
