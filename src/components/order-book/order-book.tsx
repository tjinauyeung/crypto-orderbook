import React, { useEffect } from "react";
import "twin.macro";
import { Button } from "../button/button";
import { useFeed } from "../../providers/feed-provider";
import { useWindowIsActive } from "../../hooks/useWindowIsActive";
import { formatNumber } from "../../utils/formatters";
import { OrderList } from "../order-list/order-list";
import Logo from "../../assets/logo.png";

export const OrderBook = () => {
  const {
    start,
    pause,
    isPaused,
    spread,
    bids,
    maxTotals,
    asks,
    toggleFeed,
    feed,
  } = useFeed();

  const isActive = useWindowIsActive();

  useEffect(() => {
    if (!isActive) {
      pause();
    }
  }, [isActive]);

  return (
    <div tw="font-sans font-light divide-y divide-white min-h-screen flex flex-col bg-gray-900">
      <header
        tw="sticky top-0 left-0 right-0 bg-gray-900 z-20"
        style={{ borderBottom: "1px solid #777" }}
      >
        <div tw="flex items-center p-4">
          <h1 tw="flex-1 flex items-center m-0 font-sans font-light text-2xl">
            <img src={Logo} tw="h-8 w-8 mr-4" />
            Orderbook
          </h1>
          <div tw="flex-1 flex items-center justify-center flex-1 font-mono text-sm hidden md:flex">
            <span tw="mr-2">Spread</span>
            <span tw="mr-2">{formatNumber(spread)}</span>
            <span>({formatNumber((spread / bids[0]?.[0]) * 100)}%)</span>
          </div>
          <div tw="flex-1 text-right">
            {feed}
            <button onClick={isPaused ? start : pause}>
              {isPaused ? "Start" : "Pause"}
            </button>
          </div>
        </div>
      </header>
      <div tw="flex flex-col-reverse md:flex-row overflow-scroll relative flex-1 text-sm">
        <OrderList
          tw="flex-1"
          orders={bids}
          maxTotal={maxTotals.bid}
          orderType="buy"
        />
        <div
          tw="flex items-center justify-center font-mono flex md:hidden p-2"
          style={{
            borderTop: "1px solid #777",
            borderBottom: "1px solid #777",
          }}
        >
          <span tw="mr-2">Spread</span>
          <span tw="mr-2">{formatNumber(spread)}</span>
          <span>({formatNumber((spread / bids[0]?.[0]) * 100)}%)</span>
        </div>
        <OrderList
          tw="flex-1"
          orders={asks}
          maxTotal={maxTotals.ask}
          orderType="sell"
        />
      </div>
      <footer
        tw="sticky bottom-0 bg-gray-900 flex p-4 items-center justify-center"
        style={{ borderTop: "1px solid #777" }}
      >
        <Button onClick={toggleFeed}>Toggle feed</Button>
      </footer>
    </div>
  );
};
