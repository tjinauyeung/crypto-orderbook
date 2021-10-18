import React, { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { MaxTotals, OrderMessages, Orders, SocketState } from "../types";

type Feed = {
  asks: Orders;
  bids: Orders;
  status: SocketState;
  spread: number;
  maxTotals: {
    ask: number;
    bid: number;
  };
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
  toggleFeed: () => void;
  feed: string;
  isLoading: boolean;
};

const FeedContext = createContext({} as Feed);

export const useFeed = () => useContext(FeedContext);

const INITIAL_ORDER_STATE = {
  asks: [],
  bids: [],
  spread: 0,
}

export const FeedProvider = ({ children }) => {
  const { status, sendMessage } = useWebSocket({
    url: "wss://www.cryptofacilities.com/ws/v1",
    onMessage: handleMessage,
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [feed, setFeed] = useState("PI_XBTUSD");
  const prevFeed = usePrevious(feed);
  const [maxTotals, setMaxTotals] = useState<MaxTotals>({ ask: 0, bid: 0 });
  const [orders, setOrders] = useState<{ asks: Orders; bids: Orders; spread: number }>(INITIAL_ORDER_STATE);

  function handleMessage(message) {
    if (message.event === "subscribed") {
      setIsSubscribed(true);
      return;
    }
    if (message.event === "unsubscribe") {
      setOrders(INITIAL_ORDER_STATE);
      setIsSubscribed(false);
      return;
    }
    if (message.feed === "book_ui_1_snapshot") {
      setOrders({
        asks: mapOrders(message.asks, true),
        bids: mapOrders(message.bids, false),
        spread: message.bids[0][0] - message.asks[0][0],
      });
      return;
    }
    if (message.feed === "book_ui_1") {
      updateOrders(message);
      return;
    }
  }

  useEffect(() => {
    if (status === SocketState.connected) {
      if (!paused) {
        subscribe(feed);
      }
    }
    if (paused) {
      unsubscribe(feed);
    }
  }, [status, paused]);

  useEffect(() => {
    if (status === SocketState.connected && isSubscribed) {
      // unsubscribe from previous feed
      unsubscribe(prevFeed);
      // resubscribe with new feed
      subscribe(feed);
    }
  }, [feed, prevFeed]);

  const toggleFeed = () => {
    setFeed((feed) => (feed === "PI_XBTUSD" ? "PI_ETHUSD" : "PI_XBTUSD"));
  };

  const subscribe = useCallback(
    (productId) => {
      sendMessage({
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [productId],
      });
    },
    [sendMessage]
  );

  const unsubscribe = useCallback(
    (productId) => {
      sendMessage({
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: [productId],
      });
    },
    [sendMessage]
  );

  const updateOrders = throttle((msg: any) => {
    setOrders((o) => {
      return {
        asks: msg.asks.length > 0 ? mapUpdates(o.asks, msg.asks, true) : o.asks,
        bids: msg.bids.length > 0 ? mapUpdates(o.bids, msg.bids, false) : o.bids,
        spread: o.asks[0][0] - o.bids[0][0],
      };
    });
  }, 2000);

  const mapOrders = (orders: OrderMessages, isAsk: boolean): Orders => {
    let total = 0;
    const res = [];

    for (const [price, size] of orders) {
      res.push([price, size, (total += size)]);
    }

    setMaxTotals((t) => ({
      ...t,
      [isAsk ? "ask" : "bid"]: total,
    }));

    return res;
  };

  const mapUpdates = useCallback((current, updates: Orders, isAsk) => {
    let copy = [...current];
    for (const [price, size] of updates) {
      const idx = copy.findIndex((el) => el[0] == price);
      if (idx !== -1) {
        if (size === 0) {
          // remove from copy
          copy = [...copy.slice(0, idx), ...copy.slice(idx + 1)];
        } else {
          copy[idx] = [price, size];
        }
      } else {
        if (size > 0) {
          copy.push([price, size]);
        }
      }
    }

    return mapOrders(
      copy.sort((a, b) => (isAsk ? (a[0] > b[0] ? 1 : -1) : a[0] < b[0] ? 1 : -1)),
      isAsk
    );
  }, []);

  return (
    <FeedContext.Provider value={{ isLoading: isSubscribed, asks: orders.asks, bids: orders.bids, spread: orders.spread, maxTotals, paused, setPaused, toggleFeed, feed }}>
      {children}
    </FeedContext.Provider>
  );
};

const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
