import React, { useEffect } from "react";
import "twin.macro";
import Logo from "../../assets/logo.png";
import { useWindowIsActive } from "../../hooks/useWindowIsActive";
import { useFeed } from "../../providers/feed-provider";
import { OrderType } from "../../types";
import { Button } from "../button/button";
import { Footer } from "../footer/footer";
import { OrderList } from "../order-list/order-list";
import { Spread } from "../spread/spread";
import { useDebouncedResizeObserver } from "../../hooks/useDebouncedResizeObserver";
import { Overlay } from "../overlay/overlay";
import { Container } from "../container/container";

const HEADER_HEIGHT = 70;
const FOOTER_HEIGHT = 80;
const SPREAD_HEIGHT = 40;
const BREAKPOINT_SM = 768;

export const OrderBook = () => {
  const { data, feed, isLoading, isPaused, pause, resume, toggleFeed } =
    useFeed();

  const isActive = useWindowIsActive();
  const { ref, width = 1, height = 1 } = useDebouncedResizeObserver(100);

  useEffect(() => {
    if (!isActive) {
      pause();
    }
  }, [isActive]);

  return (
    <Container ref={ref}>
      <header
        tw="sticky top-0 left-0 right-0 bg-gray-900 z-20"
        style={{
          borderBottom: "1px solid #777",
          height: HEADER_HEIGHT,
        }}
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
          <div tw="flex-1 text-right font-mono text-sm">{feed}</div>
        </div>
      </header>

      <main tw="flex flex-col-reverse md:flex-row overflow-scroll relative flex-1 text-sm">
        <OrderList
          tw="flex-1"
          height={
            width > BREAKPOINT_SM
              ? height - HEADER_HEIGHT - FOOTER_HEIGHT
              : (height - HEADER_HEIGHT - FOOTER_HEIGHT - SPREAD_HEIGHT) / 2
          }
          orders={data.bids}
          maxTotal={data.maxTotals.bid}
          orderType={OrderType.BUY}
          direction={width > BREAKPOINT_SM ? "ltr" : "rtl"}
          reverse={width <= BREAKPOINT_SM}
        />
        <Spread
          tw="flex items-center justify-center font-mono flex md:hidden p-2"
          style={{
            borderTop: "1px solid #777",
            borderBottom: "1px solid #777",
            height: SPREAD_HEIGHT,
          }}
          spread={data.spread}
        />
        <OrderList
          tw="flex-1"
          height={
            width > BREAKPOINT_SM
              ? height - HEADER_HEIGHT - FOOTER_HEIGHT
              : (height - HEADER_HEIGHT - FOOTER_HEIGHT - SPREAD_HEIGHT) / 2
          }
          orders={data.asks}
          maxTotal={data.maxTotals.ask}
          orderType={OrderType.SELL}
          direction="rtl"
        />
      </main>

      <Footer style={{ height: FOOTER_HEIGHT, borderTop: "1px solid #777" }}>
        <Button onClick={isPaused ? resume : pause}>
          {isPaused ? "Resume feed" : "Pause feed"}
        </Button>
        <Button onClick={toggleFeed}>Toggle feed</Button>
      </Footer>

      {isLoading && !isPaused && <Overlay>Loading...</Overlay>}

      {isPaused && (
        <Overlay>
          <p>Paused feed. Click to resume.</p>
          <Button onClick={resume}>Resume</Button>
        </Overlay>
      )}
    </Container>
  );
};
