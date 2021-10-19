import React, { createContext, useContext, useEffect, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { usePrevious } from "../hooks/usePrevious";
import { OrderFeedData, OrderMessage, SocketState } from "../types";
import { throttle } from "../lib/throttle";
import * as mapper from "../lib/order-mapper";

type OrderFeed = {
  data: OrderFeedData;
  feed: string;
  isLoading: boolean;
  isError: boolean;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  toggleFeed: () => void;
};

const OrderFeedContext = createContext({} as OrderFeed);

export const THROTTLE_TIME = 400;

const SOCKET_URL = "wss://www.cryptofacilities.com/ws/v1";

export const ORDER_FEED = {
  BTCUSD: "PI_XBTUSD",
  ETHUSD: "PI_ETHUSD",
};

const INITIAL_ORDER_FEED_DATA = {
  asks: [],
  bids: [],
  spread: {
    amount: 0,
    percentage: 0,
  },
  maxTotals: {
    ask: 0,
    bid: 0,
  },
};

export const OrderFeedProvider = ({ children }) => {
  const { status, sendMessage } = useWebSocket({
    url: SOCKET_URL,
    onMessage: handleMessage,
  });

  const [data, setData] = useState<OrderFeedData>(INITIAL_ORDER_FEED_DATA);
  const [feed, setFeed] = useState(ORDER_FEED.BTCUSD);
  const prevFeed = usePrevious(feed);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  function handleMessage(message) {
    if (message.event === "subscribed") {
      return setIsSubscribed(true);
    }
    if (message.event === "unsubscribed") {
      return setIsSubscribed(false);
    }
    if (message.feed === "book_ui_1_snapshot") {
      resetFeed();
      return startFeed(message);
    }
    if (message.feed === "book_ui_1") {
      return updateFeed(message);
    }
  }

  const resetFeed = () => setData(INITIAL_ORDER_FEED_DATA);

  const startFeed = (message: OrderMessage) => {
    setData(mapper.mapOrderFeed(message));
  };

  const updateFeed = throttle((message: OrderMessage) => {
    setData((o) => mapper.mapOrderFeedUpdates(o, message));
  }, THROTTLE_TIME);

  useEffect(() => {
    if (isPaused) {
      return unsubscribe(feed);
    }
    if (status === SocketState.connected) {
      subscribe(feed);
    }
  }, [status, isPaused]);

  useEffect(() => {
    if (status === SocketState.connected && isSubscribed) {
      unsubscribe(prevFeed);
      subscribe(feed);
    }
  }, [feed, prevFeed]);

  const toggleFeed = () => {
    setFeed((feed) =>
      feed === ORDER_FEED.BTCUSD ? ORDER_FEED.ETHUSD : ORDER_FEED.BTCUSD
    );
  };

  const subscribe = (feed: string) => {
    sendMessage({
      event: "subscribe",
      feed: "book_ui_1",
      product_ids: [feed],
    });
  };

  const unsubscribe = (feed: string) => {
    sendMessage({
      event: "unsubscribe",
      feed: "book_ui_1",
      product_ids: [feed],
    });
  };

  return (
    <OrderFeedContext.Provider
      value={{
        data,
        feed,
        isLoading: !isSubscribed,
        isError: status === SocketState.error,
        isPaused,
        pause: () => setIsPaused(true),
        resume: () => setIsPaused(false),
        toggleFeed,
      }}
    >
      {children}
    </OrderFeedContext.Provider>
  );
};

export const useOrderFeed = () => useContext(OrderFeedContext);