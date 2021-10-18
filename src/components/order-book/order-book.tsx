import React, { useEffect } from "react";
import "twin.macro";
import { Button } from "../button/button";
import { useFeed } from "../../providers/feed-provider";
import { useWindowIsActive } from "../../hooks/useWindowIsActive";
import { OrderList } from "../order-list/order-list";
import { Spread } from "../spread/spread";
import { Footer } from "../footer/footer";
import Logo from "../../assets/logo.png";
import { OrderType } from "../../types";

export const OrderBook = () => {
  const { data, feed, isLoading, isPaused, pause, start, toggleFeed } =
    useFeed();

  const isActive = useWindowIsActive();

  useEffect(() => {
    if (!isActive) {
      pause();
    }
  }, [isActive]);

  if (isLoading) {
    return <h2>Loading...</h2>;
  }

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
          <Spread
            tw="flex-1 flex items-center justify-center flex-1 font-mono text-sm hidden md:flex"
            spread={data.spread}
          />
          <div tw="flex-1 text-right">
            <button onClick={isPaused ? start : pause}>
              {isPaused ? "Start" : "Pause"}
            </button>
          </div>
        </div>
      </header>

      <main tw="flex flex-col-reverse md:flex-row overflow-scroll relative flex-1 text-sm">
        <OrderList
          tw="flex-1"
          height={800}
          orders={data.bids}
          maxTotal={data.maxTotals.bid}
          orderType={OrderType.BUY}
        />
        <Spread
          tw="flex items-center justify-center font-mono flex md:hidden p-2"
          style={{
            borderTop: "1px solid #777",
            borderBottom: "1px solid #777",
          }}
          spread={data.spread}
        />
        <OrderList
          tw="flex-1"
          height={800}
          orders={data.asks}
          maxTotal={data.maxTotals.ask}
          orderType={OrderType.SELL}
        />
      </main>

      <Footer>
        <Button onClick={toggleFeed}>Toggle feed</Button>
        <span tw="float-right">{feed}</span>
      </Footer>
    </div>
  );
};
