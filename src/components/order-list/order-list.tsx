import React, { useCallback, useMemo } from "react";
import { Order, OrderType } from "../../types";
import { OrderListItem } from "../order-list-item/order-list-item";
import { FixedSizeList as List } from "react-window";
import "twin.macro";

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
}: OrderListProps) => {

  console.log('rerendering order-list');

  const Row = useCallback(
    ({ index, style }) => {
      const [price, size, total] = orders[index];
      return (
        <OrderListItem
          key={price}
          price={price}
          size={size}
          depth={Math.ceil((total / maxTotal) * 100)}
          style={style}
          total={total}
          orderType={orderType}
        />
      );
    },
    [orders]
  );

  return (
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
        {Row}
      </List>
    </section>
  );
};
