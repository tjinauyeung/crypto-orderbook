import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import "twin.macro";
import { useWindowIsActive } from "../../hooks/useWindowIsActive";
import { ORDER_FEED, useOrderFeed } from "../../providers/order-feed-provider";
import { Order, OrderType } from "../../types";
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
const HEIGHT_ROW = 32;
const BREAKPOINT_SM = 768;

const FEED_LABEL = {
  [ORDER_FEED.BTCUSD]: "BTC / USD",
  [ORDER_FEED.ETHUSD]: "ETH / USD",
};

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

  const isWindowActive = useWindowIsActive();
  const { ref, width = 1, height = 1 } = useDebouncedResizeObserver(100);
  const [listHeight, setListHeight] = useState(height);
  const [isMobile, setIsMobile] = useState(false);
  const [maxRows, setMaxRows] = useState(-1);

  useEffect(() => {
    if (!isWindowActive) {
      pause();
    }
  }, [isWindowActive]);

  useLayoutEffect(() => {
    setListHeight(
      isMobile
        ? (height - HEIGHT_HEADER - HEIGHT_FOOTER - HEIGHT_SPREAD) / 2
        : height - HEIGHT_HEADER - HEIGHT_FOOTER - HEIGHT_TABLE_HEAD
    );
  }, [isMobile, height]);

  useLayoutEffect(() => {
    setIsMobile(width <= BREAKPOINT_SM);
  }, [width]);

  useEffect(() => {
    if (isMobile) {
      setMaxRows(Math.floor(listHeight / HEIGHT_ROW));
    } else {
      setMaxRows(-1);
    }
  }, [listHeight, isMobile]);

  const trim = useCallback(
    (orders: Order[]): Order[] =>
      maxRows > -1 ? orders.slice(0, maxRows) : orders,
    [maxRows]
  );

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
        <div tw="flex-1 text-right font-sans font-light text-base">
          {FEED_LABEL[feed]}
        </div>
      </header>

      <main tw="flex flex-col-reverse flex-1 md:flex-row relative">
        <OrderList
          tw="flex-1"
          height={listHeight}
          orders={trim(data.bids)}
          maxTotal={data.maxTotals.bid}
          orderType={OrderType.BUY}
          direction={isMobile ? "rtl" : "ltr"}
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
          orders={isMobile ? trim(data.asks).reverse() : trim(data.asks)}
          maxTotal={data.maxTotals.ask}
          orderType={OrderType.SELL}
          direction="rtl"
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
