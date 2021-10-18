import React, { useEffect, useState } from "react";
import "twin.macro";
import { useWindowIsActive } from "../../hooks/useWindowIsActive";
import { ORDER_FEED, useOrderFeed } from "../../providers/order-feed-provider";
import { OrderType } from "../../types";
import { Button } from "../button/button";
import { Footer } from "../footer/footer";
import { OrderList } from "../order-list/order-list";
import { Spread } from "../spread/spread";
import { useDebouncedResizeObserver } from "../../hooks/useDebouncedResizeObserver";
import { OverlayMessage } from "../overlay-message/overlay-message";
import { Container } from "../container/container";

const HEIGHT_HEADER = 70;
const HEIGHT_TABLE_HEAD = 45;
const HEIGHT_SPREAD = 40;
const HEIGHT_FOOTER = 80;
const BREAKPOINT_SM = 768;

const FEED_LABEL = {
  [ORDER_FEED.BTCUSD]: 'BTC / USD',
  [ORDER_FEED.ETHUSD]: 'ETH / USD',
}

export const OrderBook = () => {
  const {
    data,
    feed,
    isLoading,
    isError,
    isPaused,
    pause,
    resume,
    toggleFeed,
  } = useOrderFeed();

  const isActive = useWindowIsActive();
  const { ref, width = 1, height = 1 } = useDebouncedResizeObserver(100);
  const [listHeight, setListHeight] = useState(height);

  useEffect(() => {
    if (!isActive) {
      pause();
    }
  }, [isActive]);

  useEffect(() => {
    setListHeight(
      width > BREAKPOINT_SM
        ? height - HEIGHT_HEADER - HEIGHT_FOOTER - HEIGHT_TABLE_HEAD
        : (height - HEIGHT_HEADER - HEIGHT_FOOTER - HEIGHT_SPREAD) / 2
    );
  }, [width, height]);

  return (
    <Container ref={ref}>
      <header
        tw="sticky top-0 left-0 right-0 z-20 flex items-center p-4 text-sm"
        style={{
          borderBottom: "1px solid #555",
          height: HEIGHT_HEADER,
        }}
      >
        <h1 tw="flex-1 font-sans font-light text-lg">Orderbook</h1>
        <Spread
          tw="flex-1 flex items-center justify-center hidden md:flex"
          spread={data.spread}
        />
        <div tw="flex-1 text-right font-sans font-light text-base">{FEED_LABEL[feed]}</div>
      </header>

      <main tw="flex flex-col-reverse flex-1 md:flex-row relative">
        <OrderList
          tw="flex-1"
          height={listHeight}
          orders={data.bids}
          maxTotal={data.maxTotals.bid}
          orderType={OrderType.BUY}
          direction={width > BREAKPOINT_SM ? "ltr" : "rtl"}
        />
        <Spread
          tw="flex items-center justify-center font-mono flex md:hidden p-2"
          style={{
            borderTop: "1px solid #555",
            borderBottom: "1px solid #555",
            height: HEIGHT_SPREAD,
          }}
          spread={data.spread}
        />
        <OrderList
          tw="flex-1"
          height={listHeight}
          orders={width > BREAKPOINT_SM ? data.asks : [...data.asks].reverse()}
          maxTotal={data.maxTotals.ask}
          orderType={OrderType.SELL}
          direction="rtl"
          reverse={width <= BREAKPOINT_SM}
          isMobile={width <= BREAKPOINT_SM}
        />
      </main>

      <Footer style={{ height: HEIGHT_FOOTER, borderTop: "1px solid #555" }}>
        <Button onClick={isPaused ? resume : pause}>
          {isPaused ? "Resume feed" : "Pause feed"}
        </Button>
        <Button onClick={toggleFeed}>Toggle feed</Button>
      </Footer>

      {isLoading && !isPaused && <OverlayMessage>Loading...</OverlayMessage>}

      {isError && (
        <OverlayMessage>
          <p>Failed to stream feed.</p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </OverlayMessage>
      )}

      {isPaused && (
        <OverlayMessage>
          <p>Paused feed. Click to resume.</p>
          <Button onClick={resume}>Resume</Button>
        </OverlayMessage>
      )}
    </Container>
  );
};
